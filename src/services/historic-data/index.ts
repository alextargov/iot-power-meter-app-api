import { CronJob } from 'cron';
import moment from 'moment';

import { loggerService } from '../logger';
import { measurementService } from '../measurement';
import { MeasurementHistoric } from '../../models/measurement.historic';

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
        const measurement = await measurementService.getMeasurements(processStartDay, processEndDay)

        await MeasurementHistoric.create({
            date: processStartDay,
            measurements: measurement,
        });
    } catch (err) {
        loggerService.error(`[${logNamespace}]: processHistoricData(): Error ${processStartDay}`);
    }
};

export const historicDataService = {
    processHistoricData,
    initCronJob,
    startJob,
    stopJob,
};
