import { ActionInfo } from "./action-info";
import { ChecklistInfo } from './checklist-info';
import { ResultInfo } from './result-info';

export interface PhaseInfo {
  checklist: ChecklistInfo;
  actions: ActionInfo[];
  results: ResultInfo[];
}
