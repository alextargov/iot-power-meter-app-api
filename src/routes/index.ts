import { Router } from 'express';

import { controller as measurementController } from './measurement.controller';

const router = Router();

router.use('/measurement', measurementController);

export const routes = router;
