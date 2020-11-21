import { SessionPhase } from './session-phase';

export class Session {
    id: string;
    specialist: string;
    operator: string;
    startDate: Date;
    endDate?: Date;
    template: string;
    phases: SessionPhase[];
}
