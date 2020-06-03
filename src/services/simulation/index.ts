import { random } from 'lodash';

import { IMeasurement } from '../../models/measurement';
import { measurementService } from '../measurement';

const generateData = () => {
    const minVoltage = 215;
    const maxVoltage = 230;
    const minCurrent = 1;
    const maxCurrent = 5.99;
    const intervalTime = 5000;

    return setInterval(() => {
        const data = {
            voltage: random(minVoltage, maxVoltage),
            appliance: 'main',
            current: random(minCurrent, maxCurrent),
            createdAt: (new Date()).getTime(),
        } as IMeasurement;
        measurementService.createMeasurement(data).then().catch();
    }, intervalTime);
};

const stopDataGeneration = (interval: NodeJS.Timeout) => {
    clearInterval(interval);
};

export const simulationService = {
    generateData,
    stopDataGeneration,
};
