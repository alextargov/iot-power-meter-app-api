import { TimeFrames } from './time-frames.enum';

export interface ITimeFrame {
    frame: TimeFrames;
    startDate: Date;
    endDate: Date;
    wholeDay?: boolean;
}
