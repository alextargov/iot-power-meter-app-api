import { ObjectId } from 'mongodb';

import { loggerService } from '../logger';
import { IUserAlarm, User } from '../../models/user';

const logNamespace = 'UserService';

const setUserAlarms = async (userId: string, alarm: IUserAlarm) => {
    if (!userId) {
        loggerService.debug(`[${logNamespace}]: setUserAlarms(): No userId provided`);
    }

    loggerService.silly(`[${logNamespace}]: setUserAlarms(): Setting user alarms with ${JSON.stringify(alarm)}`);

    alarm.createdAt = new Date().getTime();

    await User.updateMany(
        { _id: userId },
        {
            $push: {
                alarms: alarm,
            },
        },
    ).exec();
};

const getUserAlarms = async (userId: string) => {
    if (!userId) {
        loggerService.debug(`[${logNamespace}]: getUserAlarms(): No userId provided`);
    }

    loggerService.silly(`[${logNamespace}]: getUserAlarms(): Getting alarms for user ${userId}`);

    const pipeline = [
        {
            $match: {
                _id: new ObjectId(userId),
            },
        },
        { $unwind: '$alarms' },
        {
            $sort: {
                'alarms.createdAt': -1,
            },
        },
        {
            $project: {
                _id: 0,
                createdAt: '$alarms.createdAt',
                read: '$alarms.read',
                threshold: '$alarms.threshold',
                device: '$alarms.device',
                value: '$alarms.value',
                type: '$alarms.type',
            },
        },
    ];

    return User.aggregate(pipeline).exec();
};

const readUserAlarms = async (userId: string) => {
    if (!userId) {
        loggerService.debug(`[${logNamespace}]: readUserAlarms(): No userId provided`);
    }

    loggerService.silly(`[${logNamespace}]: readUserAlarms(): Setting alarms as read for user ${userId}`);

    await User.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { 'alarms.$[element].read' : true } },
       { arrayFilters: [ { 'element.read': false } ] },
    ).exec();

    return getUserAlarms(userId);
};

export const userService = {
    setUserAlarms,
    getUserAlarms,
    readUserAlarms,
};
