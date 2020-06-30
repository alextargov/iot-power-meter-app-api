import mongoose from 'mongoose';

export interface IMeasurement {
    id?: string;
    deviceId?: string;
    current: number;
    voltage: number;
    power?: number;

    createdAt?: number | Date;
    updatedAt?: number;
}

interface IMeasurementDocument extends IMeasurement, mongoose.Document {
    id?: string;
}

const schemaOptions = {
    collection: 'measurements',
    minimize: false,
    strict: false,
    versionKey: false,
    timestamps: false,
};

const measurementSchema = new mongoose.Schema({
    deviceId: {
        type: mongoose.SchemaTypes.String,
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
    createdAt: {
        type: mongoose.SchemaTypes.Number,
        required: false,
    },
}, schemaOptions);

const measurement = mongoose.model<IMeasurementDocument>('Measurements', measurementSchema);

export { measurement as Measurement };
