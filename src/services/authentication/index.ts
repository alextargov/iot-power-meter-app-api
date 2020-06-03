import * as fs from 'fs';
import * as path from 'path';
import jwt, { VerifyOptions } from 'jsonwebtoken';

import { config } from '../../config';
import { loggerService } from '../logger';

const logNamespace = 'AuthenticationService';

const privateKey  = fs.readFileSync(path.join(__dirname, '..', '..', 'secrets', 'private.key'), 'utf8');
const publicKey  = fs.readFileSync(path.join(__dirname, '..', '..', 'secrets', 'public.key'), 'utf8');

const sign = (payload, options: { subject: string, audience: string }) => {
    loggerService.silly(`[${logNamespace}]: sign(): Signing payload`);

    const signOptions: jwt.SignOptions = {
        issuer: config.get('server.auth.issuer'),
        subject: options.subject,
        audience: options.audience,
        expiresIn: 1200,
        algorithm: 'RS256',
    };

    return jwt.sign(payload, privateKey, signOptions);
};

const verify = (token, options) => {
    const verifyOptions: VerifyOptions = {
        issuer: config.get('server.auth.issuer'),
        subject: options.subject,
        audience: options.audience,
        algorithms: ['RS256'],
    };

    loggerService.silly(`[${logNamespace}]: verify(): Verify JWT`);
    try {
        return jwt.verify(token, publicKey, verifyOptions);
    } catch (err) {
        loggerService.error(`[${logNamespace}]: verify(): Error ${err}`);
        return false;
    }
};

const decode = (token) => {
    return jwt.decode(token, { complete: true });
};

export const authenticationService = {
    decode,
    verify,
    sign,
};
