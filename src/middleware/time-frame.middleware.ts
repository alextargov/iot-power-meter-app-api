import moment from 'moment';

import { Request, Response, NextFunction } from 'express';
import { timeFrameMapperService } from '../services/time-frame-mapper';

export const timeFrameMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (req.query && req.query.frame) {
        const { frame, startDate, endDate, wholeDay } = req.query as any;
        const data = {
            frame,
            startDate: req.query.startDate ? moment(new Date(startDate)).valueOf() : null,
            endDate: req.query.endDate ? moment(new Date(endDate)).valueOf() : null,
            wholeDay,
        };

        const timeFrames = await timeFrameMapperService.mapTimeFrames(data);

        req.query = timeFrames ? timeFrames[frame] : req.query;
    }

    return next();
};
