import { groupBy, isEqual, some } from 'lodash';
import moment from 'moment';

import { loggerService } from '../logger';
import { IMeasurement, Measurement } from '../../models/measurement';
import { TimeFrames } from '../time-frame-mapper/time-frames.enum';

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

const getDeviceLiveMeasurements = async (
    deviceId: string,
    startDate: number,
    endDate: number,
    frame: TimeFrames,
): Promise<IMeasurement[]> => {
    const pipeline = [{
        $match: {
            deviceId,
            createdAt: {
                $gte: startDate,
                $lte: endDate,
            },
        },
    }].concat(basePipeline as any);

    const result = await Measurement.aggregate(pipeline).exec();
    return getSampledMeasurementData(result, startDate, endDate, frame) || [];
};

const getLiveMeasurements = async (startDate: number, endDate: number, frame: TimeFrames): Promise<IMeasurement[]> => {
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

    return getSampledMeasurementData(result, startDate, endDate, frame) || [];
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

const groupMeasurementsByNMinutes = (measurements: IMeasurement[], minutes: number) => {
    const seconds = 60;
    const milliseconds = 1000;
    const groupInterval = milliseconds * seconds * minutes;

    const groupedObject = groupBy(measurements, (measurement) => {
        return Math.floor(Number(measurement.createdAt) / groupInterval);
    });

    return Object.keys(groupedObject).map((key) => {
        const reducedData = groupedObject[key].reduce((collection, measurement) => ({
            ...collection,
            deviceId: measurement.deviceId,
            current: collection.current + measurement.current,
            voltage: collection.voltage + measurement.voltage,
            power: collection.power + measurement.power,
            createdAt: Number(key) * groupInterval,
            occurrences: (collection as any).occurrences + 1,
        }), { current: 0, voltage: 0, power: 0, deviceId: null, occurrences: 0, createdAt: null } as any);

        const averagedData: IMeasurement = {
            deviceId: reducedData.deviceId,
            createdAt: moment(new Date(Number(key) * groupInterval)).valueOf(),
            current: reducedData.current / reducedData.occurrences,
            voltage: reducedData.voltage / reducedData.occurrences,
            power: reducedData.power / reducedData.occurrences,
            id: reducedData._id,
        };

        return averagedData;
    });
};

const groupMeasurementsByDay = (measurements: IMeasurement[]) => {
    const groupedObject = groupBy(measurements, (measurement) => {
        return moment(measurement.createdAt).startOf('day').valueOf();
    });

    return Object.keys(groupedObject).map((key) => {
        const reducedData = groupedObject[key].reduce((collection, measurement) => ({
            ...collection,
            deviceId: measurement.deviceId,
            current: collection.current + measurement.current,
            voltage: collection.voltage + measurement.voltage,
            power: collection.power + measurement.power,
            createdAt: Number(key),
            occurrences: (collection as any).occurrences + 1,
        }), { current: 0, voltage: 0, power: 0, deviceId: null, occurrences: 0, createdAt: null } as any);

        const averagedData: IMeasurement = {
            deviceId: reducedData.deviceId,
            createdAt: Number(key),
            current: reducedData.current / reducedData.occurrences,
            voltage: reducedData.voltage / reducedData.occurrences,
            power: reducedData.power / reducedData.occurrences,
            id: reducedData._id,
        };

        return averagedData;
    });
};

const getSampledMeasurementData = (
    measurements: IMeasurement[],
    startDate: number,
    endDate: number,
    frame: TimeFrames,
): IMeasurement[] => {
    if (frame === TimeFrames.today &&
        moment().startOf('day').valueOf() === startDate &&
        moment().endOf('day').valueOf() === endDate
    ) {
        const tenMinutesIntervalGrouping = 10;
        return groupMeasurementsByNMinutes(measurements, tenMinutesIntervalGrouping);
    }

    if (some([TimeFrames.last7days, TimeFrames.last30days, TimeFrames.custom], (iteratee) => isEqual(iteratee, frame))) {
        return groupMeasurementsByDay(measurements);
    }
    if (measurements.length) {
        console.log(measurements[0].createdAt);
    }
    return measurements;
};

export const measurementService = {
    createMeasurement,
    getLiveMeasurements,
    deleteMeasurements,
    getDeviceLiveMeasurements,
};
