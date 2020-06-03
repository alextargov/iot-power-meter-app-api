import { Request, Response, Router } from 'express';
import passport from 'passport';
import expressAsyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { User } from '../models/user';
import { loggerService } from '../services/logger';
import { authenticationService } from '../services/authentication';

const logNamespace = 'UserController';
const router = Router();

const login = (req: Request, res: Response) => {
    passport.authenticate('local', { session: false}, (err, user, info) => {
        if (err || !user) {
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
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            username,
            password: hashedPassword,
        });

        loggerService.debug(`[${logNamespace}]: User "${username}" has been registered`);

        return res.status(200).json({
            message: 'User created!',
        });
    } catch (error) {
        loggerService.error(`[${logNamespace}]: Could not register "${username}" due to error: ${error}`);

        res.status(500).send({
            message: 'Error on user creation',
        });
    }
};

router.post('/login', expressAsyncHandler(login));
router.post('/register', expressAsyncHandler(register));

export const controller = router;
