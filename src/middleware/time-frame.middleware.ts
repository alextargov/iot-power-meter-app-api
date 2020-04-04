// Inspired by the excellent HTTP Exception handling in NestJS.
import { Request, Response, NextFunction } from 'express';
import { timeFrameMapperService } from '../services/time-frame-mapper';

export const timeFrameMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (req.query && req.query.frame) {
        const data = {
            frame: req.query.frame,
            startDate: req.query.startDate ? new Date(req.query.startDate) : new Date(),
            endDate: req.query.endDate ? new Date(req.query.endDate) : new Date(),
        };

        const timeFrames = await timeFrameMapperService.mapTimeFrames(data);
        req.query = timeFrames ? timeFrames[req.query.frame] : req.query;
    }

    return next();
};
