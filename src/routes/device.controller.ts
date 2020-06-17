import { Request, Response, Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { isEmpty, some } from 'lodash';

import { loggerService } from '../services/logger';
import { historicDataService } from '../services/historic-data';
import { deviceService } from '../services/device';
import { IDevice } from '../models/device';

const logNamespace = 'DeviceController';
const router = Router();

const createDevice = async (req: Request, res: Response) => {
    const content = req.body;

    if (some([content], isEmpty)) {
        loggerService.error(`[${logNamespace}]: Unable to create device due to bad request.`);

        throw new Error('Invalid arguments provided.');
    }

    loggerService.debug(`[${logNamespace}]: Creating device.`);

    try {
        const result = await deviceService.createDevice(content);

        return res.json(result);
    } catch (error) {
        loggerService.error(`[${logNamespace}]: Could not create device due to error: ${error}`);

        throw new Error('Unable to create device');
    }
};

const updateDevice = async (req: Request, res: Response) => {
    const content = req.body as unknown as IDevice;
    const { id } = req.params;

    if (some([content, id], isEmpty)) {
        loggerService.error(`[${logNamespace}]: Unable to update device due to bad request.`);

        throw new Error('Invalid arguments provided.');
    }

    loggerService.debug(`[${logNamespace}]: Updating device.`);

    try {
        const result = await deviceService.updateDevice(id, content);

        return res.json(result);
    } catch (error) {
        loggerService.error(`[${logNamespace}]: Could not update device due to error: ${error}`);

        throw new Error('Unable to update device');
    }
};

const getDevices = async (req: Request, res: Response) => {
    try {
        const result = await deviceService.getDevices();

        return res.json(result);
    } catch (error) {
        loggerService.error(`[${logNamespace}]: Could not list devices due to error: ${error}`);

        throw new Error('Unable to list devices');
    }
};

const getDeviceById = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        loggerService.error(`[${logNamespace}]: Unable to get device due to bad request.`);

        throw new Error('Invalid arguments provided.');
    }

    try {
        const result = await deviceService.getDeviceById(id);

        return res.json(result);
    } catch (error) {
        loggerService.error(`[${logNamespace}]: Could not get device due to error: ${error}`);

        throw new Error('Unable to get device');
    }
};

const getUserDevices = async (req: Request, res: Response) => {
    const { userId } = req.params;

    if (!userId) {
        loggerService.error(`[${logNamespace}]: Unable to get device due to bad request.`);

        throw new Error('Invalid arguments provided.');
    }

    try {
        const result = await deviceService.getDeviceById(userId);

        return res.json(result);
    } catch (error) {
        loggerService.error(`[${logNamespace}]: Could not get device due to error: ${error}`);

        throw new Error('Unable to get device');
    }
};

const deleteDeviceById = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        loggerService.error(`[${logNamespace}]: Unable to delete device due to bad request.`);

        throw new Error('Invalid arguments provided.');
    }

    try {
        const result = await deviceService.deleteDevice(id);

        return res.json(result);
    } catch (error) {
        loggerService.error(`[${logNamespace}]: Could not delete device due to error: ${error}`);

        throw new Error('Unable to delete device');
    }
};

router.get('/', expressAsyncHandler(getDevices));
router.get('/:id', expressAsyncHandler(getDeviceById));
router.post('/', expressAsyncHandler(createDevice));
router.put('/:id', expressAsyncHandler(updateDevice));
router.delete('/:id', expressAsyncHandler(deleteDeviceById));

export const controller = router;
