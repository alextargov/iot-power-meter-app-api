import { AddressInfo } from 'net';

import { random } from 'lodash';
import { config } from './config';
import { app } from './server';
import { loggerService } from './services/logger';
import { mongo } from './services/mongoose';
import { IMeasurement } from './models/measurement';
import { measurementService } from './services/measurement';
import { historicDataService } from './services/historic-data';

mongo.connect()
    .then(() => {
        const server = app.listen(config.get('server.port'), () => {
            const {
                address,
                port,
            } = server.address() as AddressInfo;

            const host = [undefined, '127.0.0.1', '::', '::1'].includes(address) ? 'localhost' : address;

            loggerService.info(`Server listening at http://${host}:${port}`);
            setInterval(() => {
                const data = {
                    voltage: random(210, 225),
                    appliance: 'main',
                    current: random(1, 5.99),
                } as IMeasurement;
                measurementService.createMeasurement(data).then().catch()
            }, 5000);

            const cronJob = historicDataService.initCronJob();

            historicDataService.startJob(cronJob);
        });
    })
    .catch((e) => {
        loggerService.error(`Server error ${JSON.stringify(e)}`);
    });
