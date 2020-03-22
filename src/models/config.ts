import mongoose from 'mongoose';

export interface IConfig {
    id?: string;
    key: string;
    value: any;

    createdAt?: Date;
    updatedAt?: Date;
}

interface IConfigDocument extends IConfig, mongoose.Document {
    id?: string;
}

const schemaOptions = {
    collection: 'config',
    minimize: false,
    strict: false,
    versionKey: false,
    timestamps: true,
};

const configSchema = new mongoose.Schema({
    key: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    value: {
        type: mongoose.SchemaTypes.Mixed,
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

const config = mongoose.model<IConfigDocument>('Config', configSchema);

export { config as Config };
