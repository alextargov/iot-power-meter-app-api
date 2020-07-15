import { random } from 'lodash';

import { IMeasurement } from '../../models/measurement';
import { measurementService } from '../measurement';

const generateData = () => {
    const minVoltage = 215;
    const maxVoltage = 230;
    const minCurrent = 1;
    const maxCurrent = 5.99;
    const intervalTime = 5000;
    const minPowerFactor = 0.7;
    const maxPowerFactor = 1;
    return setInterval(() => {
        const powerFactor = random(minPowerFactor, maxPowerFactor, true);
        const voltage = random(minVoltage, maxVoltage, true);
        const current = random(minCurrent, maxCurrent, true);
        const data = {
            voltage,
            deviceId: 'dee11d4e-63c6-4d90-983c-5c9f1e79e96c',
            current,
            power: voltage * current * powerFactor,
            createdAt: (new Date()).getTime(),
        } as IMeasurement;
        // measurementService.createMeasurement(data).then().catch();
    }, intervalTime);
};

const stopDataGeneration = (interval: NodeJS.Timeout) => {
    clearInterval(interval);
};

export const simulationService = {
    generateData,
    stopDataGeneration,
};
