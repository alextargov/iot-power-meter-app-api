import passport from 'passport';
import passportJWT from 'passport-jwt';
import passportLocal from 'passport-local';
import bcrypt from 'bcrypt';

import { loggerService } from './services/logger';
import { User } from './models/user';

const logNamespace = 'AuthConfig';
const extractJWT = passportJWT.ExtractJwt;

passport.use(new passportLocal.Strategy(async (username, password, done) => {
    try {
        const user = await User.findOne({ username }).lean().exec();

        if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
        }

        const isEqual = await bcrypt.compare(password, user.password);

        if (!isEqual) {
            return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, { ...user});
    } catch (error) {
        loggerService.error(`[${logNamespace}] Could not login on local strategy due to ${error}`);
        done(error);
    }
}));

passport.use(new passportJWT.Strategy(
    { jwtFromRequest: extractJWT.fromAuthHeaderAsBearerToken(), secretOrKey: 'your_jwt_secret' },
    async (jwtPayload, cb) => {
        try {
            const user = await User.findOne({ username: jwtPayload.username }).lean().exec();

            const isEqual = jwtPayload.password === user.password;

            return isEqual ? cb(null, user) : cb({ status: 500, message: 'Invalid user' });
        } catch (error) {
            loggerService.error(`[${logNamespace}] Could not login on JWT strategy due to ${error}`);
            return cb({ status: 500, error });
        }
    },
));
