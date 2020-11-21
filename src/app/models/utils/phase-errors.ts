export interface PhaseErrors {
    checklistId: string;
    missing: Map<string, string[]>;
    invalid: Map<string, string[]>;
}