import { Action } from './action';
import { Result } from './result';

export class SessionPhase {
    checklist: string;
    actions: Action[];
    results: Result[];
}