import { TimeFrames } from './time-frames.enum';

export interface ITimeFrame {
    frame: TimeFrames;
    startDate: number;
    endDate: number;
    wholeDay?: boolean;
}
