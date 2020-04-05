import moment from 'moment';

import { Request, Response, NextFunction } from 'express';
import { timeFrameMapperService } from '../services/time-frame-mapper';

export const timeFrameMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (req.query && req.query.frame) {
        const data = {
            frame: req.query.frame,
            startDate: req.query.startDate ? moment.utc(new Date(req.query.startDate)).toDate() : moment.utc().toDate(),
            endDate: req.query.endDate ? moment.utc(new Date(req.query.endDate)).toDate() : moment.utc().toDate(),
            wholeDay: req.query.wholeDay,
        };

        const timeFrames = await timeFrameMapperService.mapTimeFrames(data);

        req.query = timeFrames ? timeFrames[req.query.frame] : req.query;
    }

    return next();
};
