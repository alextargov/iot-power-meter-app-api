import winston from 'winston';

import { config } from '../../config';

const { colorize, combine, printf, timestamp } = winston.format;

export const loggerService = winston.createLogger({
    level: config.get('log.level'),
    format: combine(
        colorize(),
        timestamp(),
        printf((log) => `${log.timestamp} ${log.level}: ${log.message}`),
    ),
    transports: [
        new winston.transports.Console(),
    ],
});
