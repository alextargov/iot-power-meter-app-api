import convict from 'convict';
import fs from 'fs';
import yaml from 'js-yaml';

convict.addParser([
    { extension: ['yml', 'yaml'], parse: yaml.safeLoad },
]);

export const schema: convict.Schema<any> = {
    cluster: {
        doc: 'The cluster being managed, should have a corresponding cluster configuration in Vault.',
        format: '*',
        default: null,
        env: 'APP_CLUSTER',
    },
    environment: {
        doc: 'The application environment.',
        format: [
            'production',
            'development',
            'test',
        ],
        default: 'production',
        env: 'NODE_ENV',
    },
    log: {
        level: {
            doc: 'The application log level.',
            format: [
                'debug',
                'error',
                'info',
                'silly',
                'warn',
                'verbose',
            ],
            default: 'info',
            env: 'APP_LOG_LEVEL',
        },
    },
    server: {
        cors: {
            methods: {
                doc: 'The CORS allowed methods',
                format: '*',
                default: 'GET,HEAD,PUT,PATCH,POST,DELETE',
                env: 'APP_CORS_METHODS',
            },
            origin: {
                doc: 'The CORS origin.',
                format: '*',
                default: '*',
                env: 'APP_CORS_ORIGIN',
            },
            preflightContinue: {
                doc: 'Whether to allow preflight to continue to the next handler.',
                format: Boolean,
                default: true,
                env: 'APP_CORS_PREFLIGHT_CONTINUE',
            },
            optionsSuccessStatus: {
                doc: 'The status code to send on successful OPTIONS requests.',
                format: 'nat',
                default: 204,
                env: 'APP_CORS_OPTIONS_SUCCESS_STATUS',
            },
        },
        port: {
            doc: 'The server listening port.',
            format: 'port',
            default: 3000,
            env: 'PORT',
        },
        proxy: {
            doc: 'Whether or not to trust the upstream proxy.',
            format: Boolean,
            default: false,
            env: 'APP_PROXY',
        },
    }
};

export const config = convict(schema);

const env = config.get('environment');

const configFiles = [
    `${__dirname}/../config/${env}.json`,
    `${__dirname}/../config/${env}.yaml`,
    `${__dirname}/../config/local.json`,
    `${__dirname}/../config/local.yaml`,
    ...(process.env.APP_CONFIG_FILES !== undefined ? process.env.APP_CONFIG_FILES.split(',') : []),
].reduce((sum, configFile) => {
    if (configFile === undefined || !fs.existsSync(configFile)) {
        return sum;
    }

    sum.push(configFile);

    if (env !== 'test') {
        console.log(`[CONFIG] Loading with configuration file: ${configFile}`);
    }

    return sum;
}, []);

config.loadFile(configFiles);

config.validate();

if (config.get('cluster') === null) {
    throw new Error('Cluster not provided.');
}
