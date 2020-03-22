import moment from 'moment';

import { loggerService } from '../logger';
import { Config } from '../../models/config';
import { TimeFrames } from './time-frames.enum';

const logNamespace = 'TimeFrameMapperService';

const mapTimeFrames = async (): Promise<Date> => {
    loggerService.debug(`[${logNamespace}]: mapTimeFrames(): Get time frames.`);

    const result = await Config.findOne({ key: 'timeFrames' }).exec();

    return result.value.map((config) => {
        switch (config) {
            case TimeFrames.last30days:
                // tslint:disable-next-line: no-magic-numbers
                return moment.utc().subtract(30, 'days').toDate();
            case TimeFrames.last7days:
                // tslint:disable-next-line: no-magic-numbers
                return moment.utc().subtract(7, 'days').toDate();
            case TimeFrames.today:
                return moment.utc().startOf('day');
            case TimeFrames.custom:
            default: return undefined;
        }
    });
};

export const measurementService = {
    mapTimeFrames,
};
