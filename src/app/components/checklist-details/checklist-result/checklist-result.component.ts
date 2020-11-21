import { Component, Input } from '@angular/core';
import { Checklist } from 'src/app/models/checklist';

@Component({
  selector: 'app-checklist-result',
  templateUrl: './checklist-result.component.html',
  styleUrls: ['./checklist-result.component.css']
})
export class ChecklistResultComponent {

  @Input("checklist")
  checklist: Checklist;
}
