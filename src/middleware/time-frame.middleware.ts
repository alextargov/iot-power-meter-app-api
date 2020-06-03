import moment from 'moment';

import { Request, Response, NextFunction } from 'express';
import { timeFrameMapperService } from '../services/time-frame-mapper';
import { ITimeFrame } from '../services/time-frame-mapper/time-frame.interface';

export const timeFrameMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (req.query && req.query.frame) {
        const { frame, startDate, endDate, wholeDay } = req.query as unknown as ITimeFrame;
        const data = {
            frame,
            startDate: req.query.startDate ? moment(new Date(startDate)).toDate() : moment().toDate(),
            endDate: req.query.endDate ? moment(new Date(endDate)).toDate() : moment().toDate(),
            wholeDay,
        };

        const timeFrames = await timeFrameMapperService.mapTimeFrames(data);

        req.query = timeFrames ? timeFrames[frame] : req.query;
    }

    return next();
};
