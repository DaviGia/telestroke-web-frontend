import { Component, Input, OnInit } from '@angular/core';
import { PhaseInfo } from '../../../models/info/phase-info';
import { ChecklistService } from 'src/app/services/checklist.service';
import { Checklist } from 'src/app/models/checklist';
import moment from 'moment';
import { ActionInfo } from 'src/app/models/info/action-info';
import { ResultInfo } from 'src/app/models/info/result-info';
import { String as StringFormatter } from 'typescript-string-operations';

@Component({
  selector: 'app-session-phase',
  templateUrl: './session-phase.component.html',
  styleUrls: ['./session-phase.component.css']
})
export class SessionPhaseComponent implements OnInit {

  @Input("phase")
  phase: PhaseInfo;
  checklist: Checklist;
  loaded: boolean = false;

  /**
   * Expose moment lib in template.
   */
  moment = moment;

  constructor(private checklistService: ChecklistService) {}

  ngOnInit() {
    this.checklistService.getChecklist(this.phase.checklist.id).subscribe(i => {
      this.checklist = i;
      this.loaded = true;
    })
  }

  getValueDescription(actionInfo: ActionInfo): string {
    let field = this.checklist.steps.find(i => i.id == actionInfo.step.id).fields.find(i => i.id == actionInfo.field.id)
    if (field) {
      let fieldValue = field.values.find(i => i.value == actionInfo.value)
      if (fieldValue) {
        return fieldValue.name;
      }
    }
    return '';
  }

  formatResultValue(result: ResultInfo): string {
    return StringFormatter.Format(result.displayFormat, result.value);
  }
}
