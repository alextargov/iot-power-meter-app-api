import { Request, Response, Router } from 'express';
import expressAsyncHandler from 'express-async-handler';

import { loggerService } from '../services/logger';
import { configService } from '../services/config';

const logNamespace = 'ConfigController';
const router = Router();

const getConfigs = async (req: Request, res: Response) => {
    try {
        const result = await configService.getConfigs();

        return res.json(result);
    } catch (error) {
        loggerService.error(`[${logNamespace}]: Could not list configs due to error: ${error}`);

        throw new Error('Unable to list configs');
    }
};

const getConfig = async (req: Request, res: Response) => {
    const { name } = req.params;

    try {
        const result = await configService.getConfig(name);

        return res.json(result);
    } catch (error) {
        if (error.response) {
            throw error;
        }

        loggerService.error(`[${logNamespace}]: Could not fetch "${name}" config due to error: ${error}`);

        throw new Error('Unable to fetch config.');
    }
};

router.get('/', expressAsyncHandler(getConfigs));
router.get('/:name', expressAsyncHandler(getConfig));

export const controller = router;
