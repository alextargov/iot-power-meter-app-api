import mongoose from 'mongoose';
import { IMeasurement } from './measurement';

export interface IMeasurementHistoric {
    id?: string;
    averageCurrent: number;
    averageVoltage: number;
    averagePower?: number;
    measurements: IMeasurement[];
    date?: number;
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
    measurements: {
        type: mongoose.SchemaTypes.Mixed,
        required: true,
    },
    date: {
        type: mongoose.SchemaTypes.Date,
        required: true,
    },
    averageCurrent: {
        type: mongoose.SchemaTypes.Number,
        required: true,
    },
    averageVoltage: {
        type: mongoose.SchemaTypes.Number,
        required: true,
    },
    averagePower: {
        type: mongoose.SchemaTypes.Number,
        required: true,
    },
}, schemaOptions);

const measurement = mongoose.model<IMeasurementHistoricDocument>('Measurements.historic', measurementSchema);

export { measurement as MeasurementHistoric };
