import { Component, OnInit, Input } from '@angular/core';
import { Step } from 'src/app/models/step';
import { FieldConstrains } from 'src/app/models/field-constraints';

@Component({
  selector: 'app-checklist-step',
  templateUrl: './checklist-step.component.html',
  styleUrls: ['./checklist-step.component.css']
})
export class ChecklistStepComponent {

  @Input("step")
  step: Step;

  displayedColumns = ['name', 'value'];

  formatRange(constraints: FieldConstrains) {
    return `${constraints.min || '~'} / ${constraints.max || '~'}`;
  }
}
