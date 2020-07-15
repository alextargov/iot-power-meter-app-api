import { AddressInfo } from 'net';

import { config } from './config';
import { app } from './server';
import { loggerService } from './services/logger';
import { mongo } from './services/mongoose';
import { historicDataService } from './services/historic-data';
import { deviceService } from './services/device';
import { socketsService } from './services/sockets';

mongo.connect()
    .then(() => {
        const server = app.listen(config.get('server.port'), async () => {
            const {
                address,
                port,
            } = server.address() as AddressInfo;

            socketsService.initializeSocket(server, port);

            const host = [undefined, '127.0.0.1', '::', '::1'].includes(address) ? 'localhost' : address;

            loggerService.info(`Server listening at http://${host}:${port}`);

            const historicDataCron = historicDataService.initCronJob();
            const deviceCron = deviceService.initCronJob();
            await deviceService.getDevices();

            historicDataService.startJob(historicDataCron);

            deviceService.startJob(deviceCron);
        });
    })
    .catch((e) => {
        loggerService.error(`Server error ${JSON.stringify(e)}`);
    });
