import { IConfig, Config } from '../../models/config';

const getConfig = async (name: string): Promise<IConfig> => {
    return Config.findOne({ key: name }).exec();
};

const getConfigs = async (): Promise<IConfig[]> => {
    const result = await Config.find({}).exec();

    return result || [];
};

export const configService = {
    getConfigs,
    getConfig,
};
