import { Action } from 'src/app/models/action';

export interface ActionEvent {
    checklistId: string;
    action: Action;
}