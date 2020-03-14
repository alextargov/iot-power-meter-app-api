import { forOwn } from 'lodash';
import mongoose from 'mongoose';
import * as cluster from 'cluster';
import { Promise as bluebirdPromise } from 'bluebird';

import { loggerService } from '../logger';
import { config } from '../../config';

const manageConnection = (connection) => {
    return new Promise((resolveFunction, reject) => {
        let resolved = false;

        const resolve = (data?: any) => {
            resolved = true;
            resolveFunction(data);
        };

        const errorCallback = err => {
            if (!resolved) {
                return reject(err);
            }

            loggerService.error(err);
        };

        const readyCallback = () => {
            if (cluster.isMaster) {
                loggerService.info('Mongoose connection established for Master Cluster');

                return connection.close(() => {
                    loggerService.info('MongoDB Connection closed');

                    return resolve();
                });
            } else {
                return resolve(connection);
            }
        };

        connection.on('error', errorCallback);
        connection.once('connected', readyCallback);
    });
};

const buildConnectionString = (connectionConfig) => {
    let connectionStringComponents = [
        'mongodb://'
    ];

    //Credentials
    if (connectionConfig.username !== undefined && connectionConfig.password !== undefined) {
        connectionStringComponents.push(connectionConfig.username + ':' + connectionConfig.password + '@');
    }

    //Host
    if (connectionConfig.host === undefined) {
        throw new Error('Host was not defined in the config');
    }
    connectionStringComponents.push(connectionConfig.host);

    //Port
    if (connectionConfig.port !== undefined) {
        connectionStringComponents.push(':' + connectionConfig.port);
    }

    //Database
    if (connectionConfig.database === undefined) {
        throw new Error('Database was not defined in the config');
    }
    connectionStringComponents.push('/' + connectionConfig.database);

    //OptionalItems
    let optionalItems = [];

    //Replica Set
    if (connectionConfig.replicaSet !== undefined) {
        optionalItems.push('replicaSet=' + connectionConfig.replicaSet);
    }

    if (connectionConfig.options !== undefined) {
        forOwn(connectionConfig.options, (value, key) => {
            optionalItems.push(key + '=' + value);
        });
    }

    let connectionString = connectionStringComponents.join('');
    if (optionalItems.length > 0) {
        connectionString = connectionString + '?' + optionalItems.join('&');
    }

    return connectionString;
};

const connect = async () => {
    const mongoConfig = config.get('mongodb');
    const connectionString = buildConnectionString(mongoConfig);
    const options = {
        useFindAndModify: false,
        useCreateIndex: true,
        useNewUrlParser: true,
        promiseLibrary: bluebirdPromise,
        keepAlive: 2000,
        useUnifiedTopology: true,
        connectTimeoutMS: 60000,
    } as any;

    mongoose.Promise = bluebirdPromise;

    try {
        mongoose.connect(connectionString, options);

        loggerService.verbose('Default Mongoose connection established');

        await manageConnection(mongoose.connection);
    } catch (e) {
        loggerService.error('Error: ' + JSON.stringify(e));
        loggerService.error('Error: ' + e);
    }
};

export const mongo = {
    connect,
};
