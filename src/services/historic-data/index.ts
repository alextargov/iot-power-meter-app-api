import { CronJob } from 'cron';
import { groupBy } from 'lodash';
import moment from 'moment';

import { loggerService } from '../logger';
import { measurementService } from '../measurement';
import { MeasurementHistoric, IMeasurementHistoric } from '../../models/measurement.historic';
import { TimeFrames } from '../time-frame-mapper/time-frames.enum';
import { IMeasurement } from '../../models/measurement';

const logNamespace = 'HistoricDataService';

const initCronJob = () => {
    return new CronJob('0 0 4 * * *', async () => {
        await processHistoricData();
    });
};

const stopJob = (job: CronJob) => {
    job.stop();
};

const startJob = (job: CronJob) => {
    job.start();
};

const processHistoricData = async () => {
    const processStartDay = moment().subtract(1, 'day').startOf('day').valueOf();
    const processEndDay = moment().subtract(1, 'day').endOf('day').valueOf();

    loggerService.debug(`[${logNamespace}]: processHistoricData(): Processing historic data from day ${processStartDay}`);

    try {
        const measurementGroups = groupBy(
            await measurementService.getLiveMeasurements(processStartDay, processEndDay, null),
            (measurement) => measurement.deviceId,
        );

        Object.values(measurementGroups).forEach(async (measurements) => {
            if (measurements.length) {
                let current = 0;
                let voltage = 0;
                let power = 0;

                measurements.forEach((measurement) => {
                    current += measurement.current;
                    voltage += measurement.voltage;
                    power += measurement.current * measurement.voltage;
                });

                const measurementHistoric: IMeasurementHistoric = {
                    createdAt: processStartDay,
                    dataNumberCollected: measurements.length,
                    current: current / measurements.length,
                    voltage: voltage / measurements.length,
                    power: power / measurements.length,
                    deviceId: measurements[0].deviceId,
                };

                await MeasurementHistoric.create(measurementHistoric);
            }
        });
    } catch (err) {
        loggerService.error(`[${logNamespace}]: processHistoricData(): Error ${processStartDay}`);
    }
};

const simplifyData = (data: IMeasurement[], timeFrame: TimeFrames): IMeasurement[] => {
    if (!data) {
        return [];
    }

    let startOfType: moment.unitOfTime.StartOf;

    switch (timeFrame) {
        case TimeFrames.last30days:
            startOfType = 'day';
            break;
        case TimeFrames.last7days:
            startOfType = 'hour';
            break;
        case TimeFrames.today:
            startOfType = 'minute';
            break;
        default:
            startOfType = 'minute';
    }

    const filtered = data.reduce((collection, item) => {
        const date = moment.utc(item.createdAt).startOf(startOfType).valueOf();

        if (!collection[date]) {
            return {
                ...collection,
                [date]: {
                    iteration: 1,
                    data: {
                        createdAt: date,
                        current: item.current,
                        voltage: item.voltage,
                        power: item.power,
                    },
                },
            };
        }
        return {
            ...collection,
            [date]: {
                ...collection[date],
                iteration: collection[date].iteration + 1,
                data: {
                    ...collection[date].data,
                    current: collection[date].data.current + item.current,
                    voltage: collection[date].data.voltage + item.voltage,
                    power: collection[date].data.current + item.power,
                },
            },
        };
    }, {} as any);

    return Object.values(filtered).map((item: any) => ({
        // tslint:disable-next-line: no-magic-numbers
        createdAt: new Date(item.data.createdAt * 1000).getTime(),
        current: item.data.current / item.iteration,
        voltage: item.data.voltage / item.iteration,
        power: item.data.power / item.iteration,
    }));
};

const getHistoricData = async (startDate: number, frame: TimeFrames): Promise<IMeasurementHistoric[]> => {
    loggerService.debug(
        `[${logNamespace}]: getHistoricData(): Get historic data for ${startDate} in the time frame ${frame}`,
    );

    try {
        const pipeline = [
            {
                $match: {
                    createdAt: { $gte: startDate },
                },
            },
        ];

        return MeasurementHistoric.aggregate(pipeline).exec();
    } catch (err) {
        loggerService.error(`[${logNamespace}]: getHistoricData(): Error ${err}`);
    }
};

const getDeviceHistoricData = async (startDate: number, frame: TimeFrames, deviceId: string) => {
    loggerService.debug(
        `[${logNamespace}]: getDeviceHistoricData(): Get historic data for ${startDate} in the time frame ${frame}`,
    );

    try {
        const pipeline = [
            {
                $match: {
                    createdAt: { $gte: startDate },
                    deviceId,
                },
            },
        ];

        return MeasurementHistoric.aggregate(pipeline).exec();
    } catch (err) {
        loggerService.error(`[${logNamespace}]: getDeviceHistoricData(): Error ${err}`);
    }
};

export const historicDataService = {
    processHistoricData,
    getHistoricData,
    getDeviceHistoricData,
    initCronJob,
    startJob,
    stopJob,
};
