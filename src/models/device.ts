import mongoose from 'mongoose';

export interface IScheduledControl {
    startDate: Date;
    startTime: string;
    endDate: Date;
    endTime: string;
}

export interface IDevice {
    id?: string;
    userId: string;
    name: string;
    deviceId: string;
    host: string;
    key: string;
    description: string;
    isRunning: boolean;
    isCurrentAlarmEnabled: boolean;
    isVoltageAlarmEnabled: boolean;
    isPowerAlarmEnabled: boolean;
    currentAlarmThreshold: number;
    voltageAlarmThreshold: number;
    powerAlarmThreshold: number;
    scheduledControl: IScheduledControl[];
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
        host: {
            type: mongoose.SchemaTypes.String,
            required: true,
        },
        deviceId: {
            type: mongoose.SchemaTypes.String,
            required: true,
        },
        isRunning: {
            type: mongoose.SchemaTypes.Boolean,
            default: false,
        },
        isCurrentAlarmEnabled: {
            type: mongoose.SchemaTypes.Boolean,
        },
        isVoltageAlarmEnabled: {
            type: mongoose.SchemaTypes.Boolean,
        },
        isPowerAlarmEnabled: {
            type: mongoose.SchemaTypes.Boolean,
        },
        currentAlarmThreshold: {
            type: mongoose.SchemaTypes.Number,
        },
        voltageAlarmThreshold: {
            type: mongoose.SchemaTypes.Number,
        },
        powerAlarmThreshold: {
            type: mongoose.SchemaTypes.Number,
        },
        createdAt: {
            type: mongoose.SchemaTypes.Number,
        },
        updatedAt: {
            type: mongoose.SchemaTypes.Number,
        },
        scheduledControl: {
            type: mongoose.SchemaTypes.Mixed,
        },
    },
    schemaOptions,
);

const device = mongoose.model<IDeviceDocument>('Devices', deviceSchema);

export { device as Device };
