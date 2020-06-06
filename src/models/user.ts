import mongoose from 'mongoose';

export interface IUser {
    id?: string;
    username: string;
    password: string;

    createdAt?: number;
    updatedAt?: number;
}

export interface IUserDocument extends IUser, mongoose.Document {
   id: string;
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
    },
    schemaOptions,
);

const user = mongoose.model<IUserDocument>('Users', userSchema);

export { user as User };
