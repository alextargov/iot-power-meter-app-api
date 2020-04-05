import { isUndefined } from 'lodash';
import moment from 'moment';

import { loggerService } from '../logger';
import { Config } from '../../models/config';
import { TimeFrames } from './time-frames.enum';
import { ITimeFrame } from './time-frame.interface';

const logNamespace = 'TimeFrameMapperService';

const mapTimeFrames = async (routeTimeFrame: ITimeFrame): Promise<ITimeFrame> => {
    loggerService.debug(`[${logNamespace}]: mapTimeFrames(): Get time frames.`);

    const result = await Config.findOne({ key: 'timeFrames' }).exec();
    const wholeDay = isUndefined(routeTimeFrame.wholeDay);

    return result.value.reduce((collection, config) => {
        switch (config.frame) {
            case TimeFrames.last30days:
                return {
                    ...collection,
                    [config.frame]: {
                        frame: config.frame,
                        // tslint:disable-next-line: no-magic-numbers
                        startDate: moment.utc().subtract(30, 'days').startOf('day').toDate(),
                        endDate: moment.utc().endOf('day').toDate(),
                    },
                };
            case TimeFrames.last7days:
                return {
                    ...collection,
                    [config.frame]: {
                        frame: config.frame,
                        // tslint:disable-next-line: no-magic-numbers
                        startDate: moment.utc().subtract(7, 'days').startOf('day').toDate(),
                        endDate: moment.utc().endOf('day').toDate(),
                    },
                };
            case TimeFrames.today:
                return {
                    ...collection,
                    [config.frame]: {
                        frame: config.frame,
                        startDate: moment.utc().startOf('day').toDate(),
                        endDate: moment.utc().endOf('day').toDate(),
                    },
                };
            case TimeFrames.custom:
            default:
                return {
                    ...collection,
                    [config.frame]: {
                        frame: config.frame,
                        startDate: wholeDay ?
                            moment.utc(routeTimeFrame.startDate).startOf('day').toDate() :
                            moment.utc(routeTimeFrame.startDate).toDate(),
                        endDate: wholeDay ?
                            moment.utc(routeTimeFrame.endDate).endOf('day').toDate() :
                            moment.utc(routeTimeFrame.endDate).toDate(),
                    },
                };
        }
    }, {});
};

export const timeFrameMapperService = {
    mapTimeFrames,
};
