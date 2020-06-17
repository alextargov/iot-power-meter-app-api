import mongoose from 'mongoose';

export interface IDevice {
    id?: string;
    userId: string;
    name: string;
    description: string;
    isRunning: boolean;
    createdAt?: number;
    updatedAt?: number;
}

export interface IDeviceDocument extends IDevice, mongoose.Document {
   id: string;
}

const Schema = mongoose.Schema;

const schemaOptions = {
    collection: 'devices',
    minimize: false,
    strict: true,
    timestamps: true,
};

const deviceSchema = new Schema(
    {
        name: {
            type: mongoose.SchemaTypes.String,
            required: true,
        },
        description: {
            type: mongoose.SchemaTypes.String,
            required: true,
        },
        userId: {
            type: mongoose.SchemaTypes.String,
            required: true,
        },
        isRunning: {
            type: mongoose.SchemaTypes.Boolean,
            required: true,
            default: false,
        },
        createdAt: {
            type: mongoose.SchemaTypes.Number,
        },
        updatedAt: {
            type: mongoose.SchemaTypes.Number,
        },
    },
    schemaOptions,
);

const device = mongoose.model<IDeviceDocument>('Devices', deviceSchema);

export { device as Device };
