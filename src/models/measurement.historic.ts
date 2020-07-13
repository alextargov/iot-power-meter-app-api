import mongoose from 'mongoose';
import { IMeasurement } from './measurement';

export interface IMeasurementHistoric {
    id?: string;
    current: number;
    voltage: number;
    power?: number;
    dataNumberCollected: number;
    date?: number;
    createdAt: number;
    deviceId: string;
}

interface IMeasurementHistoricDocument extends IMeasurement, mongoose.Document {
    measurements: IMeasurement[];
    date: number;
    id?: string;
}

const schemaOptions = {
    collection: 'measurements.historic',
    minimize: false,
    strict: false,
    versionKey: false,
};

const measurementSchema = new mongoose.Schema({
    dataNumberCollected: {
        type: mongoose.SchemaTypes.Number,
        required: true,
    },
    createdAt: {
        type: mongoose.SchemaTypes.Number,
        required: true,
    },
    current: {
        type: mongoose.SchemaTypes.Number,
        required: true,
    },
    voltage: {
        type: mongoose.SchemaTypes.Number,
        required: true,
    },
    power: {
        type: mongoose.SchemaTypes.Number,
        required: true,
    },
    deviceId: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
}, schemaOptions);

const measurement = mongoose.model<IMeasurementHistoricDocument>('Measurements.historic', measurementSchema);

export { measurement as MeasurementHistoric };
