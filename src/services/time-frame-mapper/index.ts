import moment from 'moment';

import { loggerService } from '../logger';
import { Config } from '../../models/config';
import { TimeFrames } from './time-frames.enum';
import { ITimeFrame } from './time-frame.interface';

const logNamespace = 'TimeFrameMapperService';

const mapTimeFrames = async (routeTimeFrame: ITimeFrame): Promise<ITimeFrame> => {
    loggerService.debug(`[${logNamespace}]: mapTimeFrames(): Get time frames.`);

    const result = await Config.findOne({ key: 'timeFrames' }).exec();

    return result.value.reduce((collection, config) => {
        switch (config.frame) {
            case TimeFrames.last30days:
                return {
                    ...collection,
                    [config.frame]: {
                        frame: config.frame,
                        // tslint:disable-next-line: no-magic-numbers
                        startDate: moment().subtract(30, 'days').toDate(),
                        endDate: moment().toDate(),
                    },
                };
            case TimeFrames.last7days:
                return {
                    ...collection,
                    [config.frame]: {
                        frame: config.frame,
                        // tslint:disable-next-line: no-magic-numbers
                        startDate: moment().subtract(7, 'days').toDate(),
                        endDate: moment().toDate(),
                    },
                };
            case TimeFrames.today:
                return {
                    ...collection,
                    [config.frame]: {
                        frame: config.frame,
                        startDate: moment().startOf('day').toDate(),
                        endDate: moment().toDate(),
                    },
                };
            case TimeFrames.custom:
            default:
                return {
                    ...collection,
                    [config.frame]: {
                        frame: config.frame,
                        startDate: moment(routeTimeFrame.startDate).startOf('day').toDate(),
                        endDate: moment(routeTimeFrame.endDate).endOf('day').toDate(),
                    },
                };
        }
    }, {});
};

export const timeFrameMapperService = {
    mapTimeFrames,
};
