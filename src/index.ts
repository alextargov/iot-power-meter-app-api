import { AddressInfo } from 'net';

import { config } from './config';
import { app } from './server';
import { loggerService } from './services/logger';
import { mongo } from './services/mongoose';
import { historicDataService } from './services/historic-data';
import { simulationService } from './services/simulation';

mongo.connect()
    .then(() => {
        const server = app.listen(config.get('server.port'), () => {
            const {
                address,
                port,
            } = server.address() as AddressInfo;

            const host = [undefined, '127.0.0.1', '::', '::1'].includes(address) ? 'localhost' : address;

            loggerService.info(`Server listening at http://${host}:${port}`);

            const cronJob = historicDataService.initCronJob();

            simulationService.generateData();

            historicDataService.startJob(cronJob);
        });
    })
    .catch((e) => {
        loggerService.error(`Server error ${JSON.stringify(e)}`);
    });
