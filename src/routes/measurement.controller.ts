import { Request, Response, Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { isEmpty, some } from 'lodash';

import { loggerService } from '../services/logger';
import { measurementService } from '../services/measurement';
import { historicDataService } from '../services/historic-data';
import { ITimeFrame } from '../services/time-frame-mapper/time-frame.interface';

const logNamespace = 'MeasurementController';
const router = Router();

const createMeasurement = async (req: Request, res: Response) => {
    const content = req.body;
    const { startDate, endDate } = req.query as unknown as { startDate: Date, endDate: Date };

    if (some([content], isEmpty)) {
        loggerService.error(`[${logNamespace}]: Unable to create measurement due to bad request.`);

        throw new Error('Invalid arguments provided.');
    }

    loggerService.debug(`[${logNamespace}]: Creating measurement.`);

    try {
        await measurementService.createMeasurement(content);

        const result = await measurementService.getLiveMeasurements(startDate, endDate);

        return res.json(result);
    } catch (error) {
        loggerService.error(`[${logNamespace}]: Could not create measurement due to error: ${error}`);

        throw new Error('Unable to create measurement');
    }
};

const getMeasurements = async (req: Request, res: Response) => {
    const { startDate, endDate, frame } = req.query as unknown as ITimeFrame;

    try {
        const getLiveMeasurements = measurementService.getLiveMeasurements(startDate, endDate);
        const getHistoricData = historicDataService.getHistoricData(startDate, endDate, frame);

        const [liveMeasurements, historicData] = await Promise.all([getLiveMeasurements, getHistoricData]);

        return res.json([].concat(liveMeasurements, historicData));
    } catch (error) {
        loggerService.error(`[${logNamespace}]: Could not list measurements due to error: ${error}`);

        throw new Error('Unable to list measurements');
    }
};

const getApplianceMeasurements = async (req: Request, res: Response) => {
    const { name } = req.params;

    try {
        const result = await measurementService.getApplianceMeasurements(name);

        return res.json(result);
    } catch (error) {
        if (error.response) {
            throw error;
        }

        loggerService.error(`[${logNamespace}]: Could not fetch "${name}" appliance measurement due to error: ${error}`);

        throw new Error('Unable to fetch appliance measurement.');
    }
};

router.get('/', expressAsyncHandler(getMeasurements));
router.get('/:name', expressAsyncHandler(getApplianceMeasurements));
router.post('/', expressAsyncHandler(createMeasurement));

export const controller = router;
