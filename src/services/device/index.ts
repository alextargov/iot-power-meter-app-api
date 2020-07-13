import { CronJob } from 'cron';
import moment from 'moment';
import * as requestPromise from 'request-promise-native';

import { loggerService } from '../logger';
import { IDevice, Device } from '../../models/device';
import { config } from '../../config';

const logNamespace = 'DeviceService';

let currentDeviceData: IDevice[] = [];

const createDevice = async (content: IDevice): Promise<IDevice> => {
    loggerService.debug(`[${logNamespace}]: createDevice(): Creating device.`);
    loggerService.silly(`[${logNamespace}]: createDevice(): Content for device: ${JSON.stringify(content)}`);

    const isDeviceExisting = await isExisting(content.name);
    if (isDeviceExisting) {
        loggerService.debug(`[${logNamespace}]: createDevice(): Device name exists.`);
        throw new Error('Device exists');
    }

    const newDevice = await Device.create(content);
    const devices = await Device.find().exec();

    setCurrentDeviceData(devices);

    try {
        const response = await sendDataToSensor(content.host, content.deviceId, content.isRunning);

        console.log('Response', response);
    } catch (error) {
        console.log('Error', error);
    }

    return devices.find((device) => device.id === newDevice.id);
};

const updateDevice = async (id: string, content: IDevice): Promise<IDevice> => {
    loggerService.debug(`[${logNamespace}]: updateDevice(): Updating device.`);
    loggerService.silly(`[${logNamespace}]: updateDevice(): Content for device: ${JSON.stringify(content)}`);

    content.updatedAt = new Date().getTime();
    await Device.updateOne({ _id: id }, content).exec();

    const devices = await Device.find().exec();
    setCurrentDeviceData(devices);

    try {
        const response = await sendDataToSensor(content.host, content.deviceId, content.isRunning);

        console.log('Response', response);
    } catch (error) {
        console.log('Error', error);
    }

    return content;
};

const deleteDevice = async (id: string): Promise<IDevice> => {
    loggerService.debug(`[${logNamespace}]: deleteDevice(): Deleting device ${id}.`);

    const device = await Device.findById(id).exec();

    if (!device) {
        loggerService.debug(`[${logNamespace}]: deleteDevice(): No device found with id ${id}.`);
        return null;
    }

    const devices = await Device.find().exec();
    setCurrentDeviceData(devices);

    return Device.findByIdAndDelete(id).exec();
};

const getDevices = async (): Promise<IDevice[]> => {
    loggerService.debug(`[${logNamespace}]: getDevices(): Fetching all devices.`);

    const devices = await Device.find().exec();
    setCurrentDeviceData(devices);

    return devices;
};

const getDeviceById = async (id: string): Promise<IDevice> => {
    loggerService.debug(`[${logNamespace}]: getDeviceById(): Fetching device by id ${id}.`);

    const devices = await Device.find().exec();
    setCurrentDeviceData(devices);

    const device = devices.find((currentDevice) => currentDevice.id === id);

    if (!device) {
        loggerService.debug(`[${logNamespace}]: getDeviceById(): No device found.`);
        return null;
    }

    return device;
};

const getDeviceByDeviceId = async (id: string): Promise<IDevice> => {
    loggerService.debug(`[${logNamespace}]: getDeviceByDeviceId(): Fetching device by id ${id}.`);

    const devices = await Device.find().exec();
    setCurrentDeviceData(devices);

    const device = devices.find((currentDevice) => currentDevice.deviceId === id);

    if (!device) {
        loggerService.debug(`[${logNamespace}]: getDeviceByDeviceId(): No device found.`);
        return null;
    }

    return device;
};

const getDevicesByUserId = async (id: string): Promise<IDevice[]> => {
    loggerService.debug(`[${logNamespace}]: getDevicesByUserId(): Fetching devices for user ${id}.`);

    const devices = await Device.find({ userId: id }).exec();
    setCurrentDeviceData(devices);

    if (!devices) {
        loggerService.debug(`[${logNamespace}]: getDevicesByUserId(): No devices found.`);
        return null;
    }

    return devices;
};

const isExisting = async (name: string): Promise<boolean> => {
    const device = await Device.findOne({ name }).exec();

    return !!device;
};

const getCurrentDeviceData = () => currentDeviceData;
const setCurrentDeviceData = (devices) => {
    currentDeviceData = devices;
};

const sendDataToSensor = (deviceHost: string, id: string, isRunning: boolean) => {
    const relayEndpoint = config.get('sensor.relayEndpoint');
    const body = {
        isRunning,
        id,
    };
    loggerService.debug(`[${logNamespace}]: sendDataToSensor(): Sending data to sensor: ${JSON.stringify(body)}`);
    return requestPromise.post(`${deviceHost}${relayEndpoint}`, {
        body,
        json: true,
        timeout: 5000,
    });
};

const initCronJob = () => {
    return new CronJob('0 * * * * *', async () => {
        const devices = await getDevices();
        const now = moment();

        devices.forEach((device) => {
            if (device.scheduledControl) {
                device.scheduledControl.forEach((deviceSchedule) => {
                    const [startHour, startMinute] = deviceSchedule.startTime.split(':');
                    const [endHour, endMinute] = deviceSchedule.endTime.split(':');
                    const start = moment(deviceSchedule.startDate).hours(+startHour).minutes(+startMinute).startOf('minute');
                    const end = moment(deviceSchedule.endDate).hours(+endHour).minutes(+endMinute).startOf('minute');
                    const isInTimePeriod = now.isBetween(start, end);

                    if (isInTimePeriod && !device.isRunning) {
                        sendDataToSensor(device.host, device.deviceId, true);
                        return;
                    }

                    if (!isInTimePeriod && device.isRunning) {
                        sendDataToSensor(device.host, device.deviceId, false);
                    }
                });
            }
        });
    });
};

const stopJob = (job: CronJob) => {
    job.stop();
};

const startJob = (job: CronJob) => {
    job.start();
};

export const deviceService = {
    createDevice,
    updateDevice,
    deleteDevice,
    getDevices,
    getDeviceById,
    getDevicesByUserId,
    getCurrentDeviceData,
    getDeviceByDeviceId,
    initCronJob,
    startJob,
    stopJob,
};
