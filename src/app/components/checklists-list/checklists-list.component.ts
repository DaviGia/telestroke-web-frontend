import { Component } from '@angular/core';
import { Checklist } from 'src/app/models/checklist';
import { ListComponent } from '../common/list.component';
import { ChecklistService } from 'src/app/services/checklist.service';
import { PageEvent } from '@angular/material';

@Component({
  selector: 'app-checklists-list',
  templateUrl: './checklists-list.component.html',
  styleUrls: ['./checklists-list.component.css']
})
export class ChecklistsListComponent extends ListComponent<Checklist> {

  constructor(private checklistService: ChecklistService) {
    super();
  }

  fetchData(event?: PageEvent) {
    return this.checklistService.getChecklistPage(event);   
  }
}
