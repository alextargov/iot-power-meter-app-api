import { Request, Response, Router } from 'express';
import passport from 'passport';
import expressAsyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { User } from '../models/user';
import { loggerService } from '../services/logger';
import { authenticationService } from '../services/authentication';
import { userService } from '../services/user';

const logNamespace = 'UserController';
const router = Router();

const login = (req: Request, res: Response) => {
    passport.authenticate('local', { session: false}, (err, user, info) => {
        if (err || !user) {
            // tslint:disable-next-line: no-magic-numbers
            return res.status(400).json({
                message: err.message,
                user,
            });
        }
        req.login(user, { session: false }, (loginError) => {
            if (loginError) {
                res.send(loginError);
            }
            const token = authenticationService.sign(user, {
                audience: 'clientId',
                subject: user.username,
            });
            return res.json({ token });
        });
    })(req, res);
};

const register = async (req: Request, res: Response) => {
    const { username , password } = req.body;

    const user = await User.findOne({ username }).exec();

    if (user) {
        return res.json({
            message: 'User exists',
        });
    }

    try {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            username,
            password: hashedPassword,
        });

        loggerService.debug(`[${logNamespace}]: User "${username}" has been registered`);

        // tslint:disable-next-line: no-magic-numbers
        return res.status(200).json({
            message: 'User created!',
        });
    } catch (error) {
        loggerService.error(`[${logNamespace}]: Could not register "${username}" due to error: ${error}`);

        // tslint:disable-next-line: no-magic-numbers
        res.status(500).send({
            message: 'Error on user creation',
        });
    }
};

const getUserAlarms = async (req: Request, res: Response) => {
    const { userId } = req.params;

    if (!userId) {
        loggerService.debug(`[${logNamespace}]: getUserAlarms(): No userId provided`);
    }

    try {
        const result = await userService.getUserAlarms(userId);

        res.json(result);
    } catch (error) {
        loggerService.error(`[${logNamespace}]: Could not get user alarms for "${userId}" due to error: ${error}`);

        throw new Error('Unable to fetch user alarms.');
    }
};

const readUserAlarms = async (req: Request, res: Response) => {
    const { userId } = req.params;

    if (!userId) {
        loggerService.debug(`[${logNamespace}]: readUserAlarms(): No userId provided`);
    }

    try {
        const result = await userService.readUserAlarms(userId);

        res.json(result);
    } catch (error) {
        loggerService.error(`[${logNamespace}]: Could not set to read user alarms for "${userId}" due to error: ${error}`);

        throw new Error('Unable to set to read user alarms.');
    }
};

router.post('/:userId/alarms/read', expressAsyncHandler(readUserAlarms));
router.post('/login', expressAsyncHandler(login));
router.post('/register', expressAsyncHandler(register));
router.get('/:userId/alarms', expressAsyncHandler(getUserAlarms));

export const controller = router;
