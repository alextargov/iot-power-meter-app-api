import { Router } from 'express';
import passport from 'passport';

import { controller as measurementController } from './measurement.controller';
import { controller as configController } from './config.controller';
import { controller as timeFrameController } from './time-frame.controller';
import { controller as userController } from './user.controller';

import { timeFrameMiddleware } from '../middleware/time-frame.middleware';

const router = Router();

router.use(timeFrameMiddleware);

router.use('/measurement', passport.authenticate('jwt', { session: false, authInfo: true }), measurementController);
router.use('/config', configController);
router.use('/timeFrame', timeFrameController);
router.use('/user', userController);

export const routes = router;
