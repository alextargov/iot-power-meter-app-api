import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export enum UserAlarmEnum {
    Current = 'Current',
    Voltage = 'Voltage',
    Power = 'Power',
}

export interface IUserAlarm {
    read: boolean;
    threshold: number;
    value: number;
    device: string;
    createdAt: number;
    type: UserAlarmEnum;
}

export interface IUser {
    id?: string;
    _id: string | ObjectId;
    username: string;
    password: string;
    alarms: IUserAlarm[];
    createdAt?: number;
    updatedAt?: number;
}

export interface IUserDocument extends IUser, mongoose.Document {
   id: string;
   _id: string | ObjectId;
}

const Schema = mongoose.Schema;

const schemaOptions = {
    collection: 'users',
    minimize: false,
    strict: true,
    timestamps: true,
};

const userSchema = new Schema(
    {
        username: {
            type: mongoose.SchemaTypes.String,
            required: true,
        },
        password: {
            type: mongoose.SchemaTypes.String,
            required: true,
        },
        createdAt: {
            type: mongoose.SchemaTypes.Number,
        },
        alarms: {
            type: mongoose.SchemaTypes.Mixed,
        },
    },
    schemaOptions,
);

const user = mongoose.model<IUserDocument>('Users', userSchema);

export { user as User };
