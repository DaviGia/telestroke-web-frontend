import { SessionInfo } from './session-info';
import { PhaseInfo } from './phase-info';

export class CompleteSessionInfo extends SessionInfo {
    phases: PhaseInfo[];
}