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

    // tslint:disable-next-line: cyclomatic-complexity
    return result.value.reduce((collection, config) => {
        switch (config.frame) {
            case TimeFrames.last30days:
                return {
                    ...collection,
                    [config.frame]: {
                        frame: config.frame,
                        // tslint:disable-next-line: no-magic-numbers
                        startDate: moment().subtract(30, 'days').startOf('day').valueOf(),
                        endDate: moment().endOf('day').valueOf(),
                    },
                };
            case TimeFrames.last7days:
                return {
                    ...collection,
                    [config.frame]: {
                        frame: config.frame,
                        // tslint:disable-next-line: no-magic-numbers
                        startDate: moment().subtract(7, 'days').startOf('day').valueOf(),
                        endDate: moment().endOf('day').valueOf(),
                    },
                };
            case TimeFrames.today:
                return {
                    ...collection,
                    [config.frame]: {
                        frame: config.frame,
                        startDate: routeTimeFrame.startDate ? routeTimeFrame.startDate : moment().startOf('day').valueOf(),
                        endDate: routeTimeFrame.endDate ? routeTimeFrame.endDate : moment().endOf('day').valueOf(),
                    },
                };
            case TimeFrames.todayPartly:
                return {
                    ...collection,
                    [config.frame]: {
                        frame: config.frame,
                        startDate: routeTimeFrame.startDate,
                        endDate: routeTimeFrame.endDate,
                    },
                };
            case TimeFrames.todayLive:
                const fiveMinuteFrame = 5;
                return {
                    ...collection,
                    [config.frame]: {
                        frame: config.frame,
                        startDate: moment().subtract(fiveMinuteFrame, 'minutes').valueOf(),
                        endDate: moment().valueOf(),
                    },
                };
            case TimeFrames.custom:
            default:
                return {
                    ...collection,
                    [config.frame]: {
                        frame: config.frame,
                        startDate: wholeDay ?
                            moment(routeTimeFrame.startDate).startOf('day').valueOf() :
                            moment(routeTimeFrame.startDate).valueOf(),
                        endDate: wholeDay ?
                            moment(routeTimeFrame.endDate).endOf('day').valueOf() :
                            moment(routeTimeFrame.endDate).valueOf(),
                    },
                };
        }
    }, {});
};

export const timeFrameMapperService = {
    mapTimeFrames,
};
