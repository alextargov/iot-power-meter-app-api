// Inspired by the excellent HTTP Exception handling in NestJS.
import { Request, Response, NextFunction } from 'express';
import { timeFrameMapperService } from '../services/time-frame-mapper';

export const timeFrameMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (req.query && req.query.frame) {
        const timeFrames = await timeFrameMapperService.mapTimeFrames(req.query.frame);
        req.query = timeFrames ? timeFrames[req.query.frame] : req.query;

        return next();
    }
};
