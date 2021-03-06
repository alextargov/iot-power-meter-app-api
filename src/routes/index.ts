import { Router } from 'express';
import passport from 'passport';

import { controller as measurementController } from './measurement.controller';
import { controller as configController } from './config.controller';
import { controller as timeFrameController } from './time-frame.controller';
import { controller as userController } from './user.controller';
import { controller as deviceController } from './device.controller';

import { timeFrameMiddleware } from '../middleware/time-frame.middleware';

const router = Router();

router.use(timeFrameMiddleware);

router.use('/measurement', measurementController);
router.use('/device', deviceController);
router.use('/config', configController);
router.use('/timeFrame', timeFrameController);
router.use('/user', userController);

export const routes = router;
