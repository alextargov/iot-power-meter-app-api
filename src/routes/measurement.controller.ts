import { Request, Response, Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { isEmpty, some, random } from 'lodash';
import moment from 'moment';

import { loggerService } from '../services/logger';
import { measurementService } from '../services/measurement';
import { historicDataService } from '../services/historic-data';
import { ITimeFrame } from '../services/time-frame-mapper/time-frame.interface';
import { IMeasurement } from '../models/measurement';
import { deviceService } from '../services/device';
import { SocketEvent } from '../constants/socket';
import { authenticationService } from '../services/authentication';
import { IUserAlarm, UserAlarmEnum } from '../models/user';
import { userService } from '../services/user';
import { socketsService } from '../services/sockets';

const logNamespace = 'MeasurementController';
const router = Router();

const createMeasurement = async (req: Request, res: Response) => {
    const content = req.body as IMeasurement;
    const { startDate, endDate } = req.query as unknown as ITimeFrame;

    if (some([content], isEmpty)) {
        loggerService.error(`[${logNamespace}]: Unable to create measurement due to bad request.`);

        throw new Error('Invalid arguments provided.');
    }

    loggerService.debug(`[${logNamespace}]: Creating measurement.`);

    try {
        content.createdAt = content.createdAt || new Date().getTime();
        const measurement = await measurementService.createMeasurement(content);

        loggerService.debug(`[${logNamespace}]: Checking for device alarms.`);

        const { payload: user } = authenticationService.decode(req.headers.authorization.split('Bearer ')[1]) as any;
        const socketConnection = socketsService.userConnections.get(user._id);

        if (user && socketConnection) {
            const userAlarm: IUserAlarm = {
                read: false,
                createdAt: new Date().getTime(),
                threshold: null,
                value: null,
                device: null,
                type: null,
            };

            deviceService.getCurrentDeviceData().forEach(async (device) => {
                userAlarm.device = device.name;
                if (device.isCurrentAlarmEnabled && content.current > device.currentAlarmThreshold) {
                    userAlarm.threshold = device.currentAlarmThreshold;
                    userAlarm.value = content.current;
                    userAlarm.type = UserAlarmEnum.Current;
                    socketConnection.emit(SocketEvent.ALARM, userAlarm);
                    await userService.setUserAlarms(user._id, userAlarm);
                }

                if (device.isVoltageAlarmEnabled && content.voltage > device.voltageAlarmThreshold) {
                    userAlarm.threshold = device.voltageAlarmThreshold;
                    userAlarm.value = content.voltage;
                    userAlarm.type = UserAlarmEnum.Voltage;
                    socketConnection.emit(SocketEvent.ALARM, userAlarm);
                    await userService.setUserAlarms(user._id, userAlarm);
                }

                if (device.isPowerAlarmEnabled && content.power > device.powerAlarmThreshold) {
                    userAlarm.threshold = device.powerAlarmThreshold;
                    userAlarm.value = content.power;
                    userAlarm.type = UserAlarmEnum.Power;
                    socketConnection.emit(SocketEvent.ALARM, userAlarm);
                    await userService.setUserAlarms(user._id, userAlarm);
                }
            });
        }

        // const result = await measurementService.getLiveMeasurements(startDate, endDate);

        return res.json(measurement);
    } catch (error) {
        loggerService.error(`[${logNamespace}]: Could not create measurement due to error: ${error}`);

        throw new Error('Unable to create measurement');
    }
};

const getMeasurements = async (req: Request, res: Response) => {
    const { startDate, endDate, frame } = req.query as unknown as ITimeFrame;

    try {
        const getLiveMeasurements = measurementService.getLiveMeasurements(startDate, endDate, frame);
        const getHistoricData = historicDataService.getHistoricData(startDate, endDate, frame);

        const [liveMeasurements, historicData] = await Promise.all([getLiveMeasurements, getHistoricData]);

        return res.json([].concat(liveMeasurements, historicData));
    } catch (error) {
        loggerService.error(`[${logNamespace}]: Could not list measurements due to error: ${error}`);

        throw new Error('Unable to list measurements');
    }
};

const getApplianceMeasurements = async (req: Request, res: Response) => {
    const { name } = req.params;
    const { startDate, endDate, frame } = req.query as unknown as ITimeFrame;

    try {
        const result = await measurementService.getDeviceLiveMeasurements(name, startDate, endDate, frame);

        return res.json(result);
    } catch (error) {
        if (error.response) {
            throw error;
        }

        loggerService.error(`[${logNamespace}]: Could not fetch "${name}" device measurement due to error: ${error}`);

        throw new Error('Unable to fetch device measurement.');
    }
};

const bulkSimulation = async (req: Request, res: Response) => {
    let momentDate = moment().startOf('day');
    let date = new Date(momentDate.toDate()).getTime();

    try {
        while (date <= new Date(moment().endOf('day').toDate()).getTime()) {
            // tslint:disable-next-line: no-magic-numbers
            const current = random(2, 5, true);
            // tslint:disable-next-line: no-magic-numbers
            const voltage = random(220, 235, true);
            await measurementService.createMeasurement({
                deviceId: 'dee11d4e-63c6-4d90-983c-5c9f1e79e96c',
                current,
                voltage,
                power: current * voltage,
                createdAt: date,
            });
            loggerService.debug(`[${logNamespace}]: bulkSimulation() Created measurement for date ${new Date(date)}`);
            // tslint:disable-next-line: no-magic-numbers
            momentDate = momentDate.add(5, 'seconds');
            date = new Date(momentDate.toDate()).getTime();
        }

        return res.json({ok: true});
    } catch (error) {
        //
    }
};

router.get('/', expressAsyncHandler(getMeasurements));
router.post('/bulkSimulation', expressAsyncHandler(bulkSimulation));
router.get('/:name', expressAsyncHandler(getApplianceMeasurements));
router.post('/', expressAsyncHandler(createMeasurement));

export const controller = router;
