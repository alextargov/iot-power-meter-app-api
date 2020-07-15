import passport from 'passport';
import passportJWT from 'passport-jwt';
import passportLocal from 'passport-local';
import bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

import { loggerService } from './services/logger';
import { User } from './models/user';
import { config } from './config';
import { omit } from 'lodash';

const logNamespace = 'AuthConfig';
const extractJWT = passportJWT.ExtractJwt;
const publicKey  = fs.readFileSync(path.join(__dirname, 'secrets', 'public.key'), 'utf8');

passport.use(new passportLocal.Strategy(async (username, password, done) => {
    try {
        const user = await User.findOne({ username }).lean().exec();

        if (!user) {
            loggerService.info(`[${logNamespace}] Could not find a user`);
            return done(null, false, { message: 'Incorrect username.' });
        }

        const isEqual = await bcrypt.compare(password, user.password);

        if (!isEqual) {
            loggerService.info(`[${logNamespace}] Passwords do not match for user ${user.username}`);
            return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, { ...omit(user, 'alarms')});
    } catch (error) {
        loggerService.error(`[${logNamespace}] Could not login on local strategy due to ${error}`);
        done(error);
    }
}));

passport.use(new passportJWT.Strategy(
    {
        jwtFromRequest: extractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: publicKey,
        algorithms: ['RS256'],
        issuer: config.get('server.auth.issuer'),
    },
    async (jwtPayload, cb) => {
        if (!jwtPayload) {
            return cb({ status: 500, error: 'JWT is empty' });
        }

        try {
            const user = await User.findOne({ username: jwtPayload.username }).lean().exec();

            const isEqual = jwtPayload.password === user.password;

            return isEqual ? cb(null, omit(user, 'alarms')) : cb({ status: 500, message: 'Invalid user' });
        } catch (error) {
            loggerService.error(`[${logNamespace}] Could not login on JWT strategy due to ${error}`);
            return cb({ status: 500, error });
        }
    },
));
