import mongoose from 'mongoose';

export interface IMeasurement {
    id?: string;
    appliance: string;
    current: number;
    voltage: number;
    power?: number;

    createdAt?: Date;
    updatedAt?: Date;
}

interface IMeasurementDocument extends IMeasurement, mongoose.Document {
    id?: string;
}

const schemaOptions = {
    collection: 'measurements',
    minimize: false,
    strict: false,
    versionKey: false,
    timestamps: true,
};

const measurementSchema = new mongoose.Schema({
    appliance: {
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
        type: mongoose.SchemaTypes.Date,
        required: true,
    },
    updatedAt: {
        type: mongoose.SchemaTypes.Date,
        required: false,
    },
}, schemaOptions);

const measurement = mongoose.model<IMeasurementDocument>('Measurements', measurementSchema);

export { measurement as Measurement };
