import moment from 'moment';

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
            created_at: 0,
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

const getLiveMeasurements = async (startDate: Date, endDate: Date): Promise<IMeasurement[]> => {
    const pipeline = [
        {
            $addFields: {
                created_at: {
                    $toDate: '$createdAt',
                },
            },
        },
        {
            $match: {
                created_at: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                },
            },
        },
    ].concat(basePipeline as any);

    const result = await Measurement.aggregate(pipeline).exec();

    return result || [];
};

const deleteMeasurements = async (startDate: Date, endDate: Date): Promise<void> => {
    const pipeline = [{
        $match: {
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
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
