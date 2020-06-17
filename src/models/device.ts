import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export interface IDevice {
    id?: string;
    userId: ObjectId;
    name: string;
    key: string;
    description: string;
    isRunning: boolean;
    createdAt?: number;
    updatedAt?: number;
}

export interface IDeviceDocument extends IDevice, mongoose.Document {
   id: string;
}

const Schema = mongoose.Schema;

const schemaOptions: mongoose.SchemaOptions = {
    collection: 'devices',
    minimize: false,
    strict: true,
    timestamps: true,
    versionKey: false,
    id: true,
};

const deviceSchema = new Schema(
    {
        name: {
            type: mongoose.SchemaTypes.String,
            required: true,
        },
        key: {
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