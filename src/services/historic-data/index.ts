import { CronJob } from 'cron';
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
    const processStartDay = moment.utc().subtract(1, 'day').startOf('day').valueOf();
    const processEndDay = moment.utc().subtract(1, 'day').endOf('day').valueOf();

    loggerService.debug(`[${logNamespace}]: processHistoricData(): Processing historic data from day ${processStartDay}`);

    try {
        const measurements = await measurementService.getLiveMeasurements(processStartDay, processEndDay);

        if (measurements.length) {
            let current = 0;
            let voltage = 0;
            let power = 0;

            const measurementsToDate: IMeasurement[] = measurements.map((measurement) => {
                current += measurement.current;
                voltage += measurement.voltage;
                power += measurement.current;

                return {
                    ...measurement,
                    createdAt: new Date(measurement.createdAt),
                };
            });

            const measurementHistoric: IMeasurementHistoric = {
                date: processStartDay,
                measurements: measurementsToDate,
                averageCurrent: current / measurements.length,
                averageVoltage: voltage / measurements.length,
                averagePower: power / measurements.length,
            };

            await MeasurementHistoric.create({

            });
        }
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
        createdAt: new Date(item.data.createdAt * 1000).getTime(),
        current: item.data.current / item.iteration,
        voltage: item.data.voltage / item.iteration,
        power: item.data.power / item.iteration,
    }));
};

const getHistoricData = async (startDate: number, endDate: number, frame: TimeFrames) => {
    loggerService.debug(
        `[${logNamespace}]: getHistoricData(): Get historic data from ${startDate} to ${endDate} in the time frame ${frame}`,
    );

    try {
        const pipeline = [
            {
                $match: {
                    date: {
                        $gte: startDate,
                        $lte: endDate,
                    },
                },
            },
            {
                $project: {
                    measurementDate: 0,
                    updatedAt: 0,
                },
            },
        ];

        const data = (await MeasurementHistoric.aggregate(pipeline).exec())[0];

        return simplifyData(data?.measurements, frame);
    } catch (err) {
        loggerService.error(`[${logNamespace}]: getHistoricData(): Error ${err}`);
    }
};

export const historicDataService = {
    processHistoricData,
    getHistoricData,
    initCronJob,
    startJob,
    stopJob,
};
