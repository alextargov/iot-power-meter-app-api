import { loggerService } from '../logger';
import { IMeasurement, Measurement } from '../../models/measurement';

const logNamespace = 'MeasurementService';

const basePipeline = [
    {
        $addFields: {
            power: {
                $multiply: ['$current', '$voltage'],
            },
        },
    },
    {
        $project: {
            updatedAt: 0,
        },
    },
];

const createMeasurement = async (content: IMeasurement): Promise<IMeasurement> => {
    loggerService.debug(`[${logNamespace}]: createMeasurement(): Creating measurement.`);
    loggerService.silly(`[${logNamespace}]: createMeasurement(): Content for measurement: ${JSON.stringify(content)}`);

    const data = {
        ...content,
    } as IMeasurement;

    await Measurement.create(data);

    return data;
};

const getApplianceMeasurements = async (name: string): Promise<IMeasurement[]> => {
    const pipeline = [{
        $match: { appliance: name },
    }].concat(basePipeline as any);

    const result = await Measurement.aggregate(pipeline).exec();
    return result || [];
};

const getLiveMeasurements = async (startDate: number, endDate: number): Promise<IMeasurement[]> => {
    loggerService.debug(
        `[${logNamespace}]: getLiveMeasurements(): Get live data from ${startDate} to ${endDate}`,
    );

    const pipeline = [
        {
            $match: {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate,
                },
            },
        },
    ].concat(basePipeline as any);

    const result = await Measurement.aggregate(pipeline).exec();

    return result || [];
};

const deleteMeasurements = async (startDate: number, endDate: number): Promise<void> => {
    const pipeline = [{
        $match: {
            createdAt: {
                $gte: startDate,
                $lte: endDate,
            },
        },
    }];

    await Measurement.deleteMany(pipeline).exec();
};

export const measurementService = {
    createMeasurement,
    getLiveMeasurements,
    deleteMeasurements,
    getApplianceMeasurements,
};
