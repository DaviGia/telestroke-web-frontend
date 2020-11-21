import { PhaseErrors } from '../utils/phase-errors';

export interface SessionErrorsResponse {
    count: number;
    errors: PhaseErrors;
}