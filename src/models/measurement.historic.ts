import mongoose from 'mongoose';
import { IMeasurement } from './measurement';

interface IMeasurementHistoricDocument extends IMeasurement, mongoose.Document {
    measurements: IMeasurement[];
    date: Date;
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
}, schemaOptions);

const measurement = mongoose.model<IMeasurementHistoricDocument>('Measurements.historic', measurementSchema);

export { measurement as MeasurementHistoric };
