import { Request, Response, Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { isEmpty, some } from 'lodash';

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

        const { payload: user } = authenticationService.decode(req.headers.token) as any;
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
        const getLiveMeasurements = measurementService.getLiveMeasurements(startDate, endDate);
        const getHistoricData = historicDataService.getHistoricData(startDate, endDate, frame);

        const [liveMeasurements, historicData] = await Promise.all([getLiveMeasurements, getHistoricData]);

        return res.json([].concat(liveMeasurements, historicData));
    } catch (error) {
        loggerService.error(`[${logNamespace}]: Could not list measurements due to error: ${error}`);

        throw new Error('Unable to list measurements');
    }
};

const getApplianceMeasurements = async (req: Request, res: Response) => {
    const { name, startDate, endDate, frame } = req.params as any;

    try {
        const result = await measurementService.getDeviceLiveMeasurements(name, startDate, endDate);

        return res.json(result);
    } catch (error) {
        if (error.response) {
            throw error;
        }

        loggerService.error(`[${logNamespace}]: Could not fetch "${name}" appliance measurement due to error: ${error}`);

        throw new Error('Unable to fetch appliance measurement.');
    }
};

router.get('/', expressAsyncHandler(getMeasurements));
router.get('/:name', expressAsyncHandler(getApplianceMeasurements));
router.post('/', expressAsyncHandler(createMeasurement));

export const controller = router;
