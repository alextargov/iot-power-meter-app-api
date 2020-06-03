import { Request, Response, Router } from 'express';
import expressAsyncHandler from 'express-async-handler';

import { loggerService } from '../services/logger';
import { timeFrameMapperService } from '../services/time-frame-mapper';
import { ITimeFrame } from '../services/time-frame-mapper/time-frame.interface';

const logNamespace = 'TimeFrameController';
const router = Router();

const getTimeFrame = async (req: Request, res: Response) => {
    const { frame, startDate, endDate } = req.query as unknown as ITimeFrame;

    try {
        const timeFrames: ITimeFrame = {
            frame,
            startDate,
            endDate,
        };

        const result = await timeFrameMapperService.mapTimeFrames(timeFrames);

        return res.json(result);
    } catch (error) {
        loggerService.error(`[${logNamespace}]: Could not list time frames due to error: ${error}`);

        throw new Error('Unable to list time frames');
    }
};

router.get('/', expressAsyncHandler(getTimeFrame));

export const controller = router;
