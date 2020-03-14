import bodyParser from 'body-parser';
import cors from 'cors';
import { default as express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { config } from './config';
import { loggerService } from './services/logger';
import { routes } from './routes';
import { errorMiddleware } from './middleware/error.middleware';

export const app = express();

app.use(helmet());
app.use(cors(config.get('server.cors')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(morgan('combined', {
    stream: {
        write: (message: string) => loggerService.info(message.trim()),
    },
}));

if (config.get('server.proxy')) {
    app.set('trust proxy', true);
}

app.use(routes);
app.use(errorMiddleware);
