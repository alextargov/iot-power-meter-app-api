import { CronJob } from 'cron';
import moment from 'moment';

import { loggerService } from '../logger';
import { measurementService } from '../measurement';
import { MeasurementHistoric } from '../../models/measurement.historic';
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
    const processStartDay = moment.utc().subtract(1, 'day').startOf('day').toDate();
    const processEndDay = moment.utc().subtract(1, 'day').endOf('day').toDate();

    loggerService.debug(`[${logNamespace}]: processHistoricData(): Processing historic data from day ${processStartDay}`);

    try {
        const measurement = await measurementService.getLiveMeasurements(processStartDay, processEndDay);

        await MeasurementHistoric.create({
            date: processStartDay,
            measurements: measurement,
        });
    } catch (err) {
        loggerService.error(`[${logNamespace}]: processHistoricData(): Error ${processStartDay}`);
    }
};

const simplifyData = (data: IMeasurement[], timeFrame: TimeFrames): IMeasurement[] => {
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
    console.log('simplifyData', data);
    const filtered = data.reduce((collection, item) => {
        const date = moment.utc(item.createdAt).startOf(startOfType).unix();

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
    console.log('simplifyData', filtered);

    return Object.values(filtered).map((item: any) => ({
        createdAt: moment.unix(item.data.createdAt).toDate(),
        current: item.data.current / item.iteration,
        voltage: item.data.voltage / item.iteration,
        power: item.data.power / item.iteration,
    }));
};

const getHistoricData = async (startDate: Date, endDate: Date, frame: TimeFrames) => {
    loggerService.debug(
        `[${logNamespace}]: getHistoricData(): Get historic data from ${startDate} to ${endDate} in the time frame ${frame}`,
    );
    console.log(startDate, endDate, frame);
    try {
        const pipeline = [
            {
                $addFields: {
                    measurementDate: {
                        $toDate: '$date',
                    },
                },
            },
            {
                $match: {
                    measurementDate: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate),
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

        return simplifyData(data.measurements, frame);
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
