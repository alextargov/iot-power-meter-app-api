import { loggerService } from '../logger';
import { IMeasurement, Measurement } from '../../models/measurement';

const logNamespace = 'MeasurementService';

const basePipeline = [{
    $addFields: {
        power: {
            $multiply: [ "$current", "$voltage" ]
        }
    }
}];

const createMeasurement = async (content: IMeasurement): Promise<IMeasurement> => {
    loggerService.debug(`[${logNamespace}]: createMeasurement(): Creating measurement.`);
    loggerService.silly(`[${logNamespace}]: createMeasurement(): Content for measurement: ${JSON.stringify(content)}`);

    const data = {
        ...content,
        createdAt: new Date(),
        updatedAt: new Date()
    } as IMeasurement;

    await Measurement.create(data);

    return data;
};

const getApplianceMeasurements = async (name: string): Promise<IMeasurement[]> => {
    const pipeline = [{
        $match: { appliance: name }
    }].concat(basePipeline as any);

    const result = await Measurement.aggregate(pipeline).exec();
    return result || [];
};

const getMeasurements = async (): Promise<IMeasurement[]> => {
    const result = await Measurement.aggregate(basePipeline).exec();

    return result || [];
};

export const measurementService = {
    createMeasurement,
    getMeasurements,
    getApplianceMeasurements
};
