import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { Session } from 'src/app/models/session';
import { ChecklistData } from '../models/checklist-data';
import { Checklist } from 'src/app/models/checklist';
import { ChecklistProgress } from '../models/checklist-progress';
import { Action } from 'src/app/models/action';
import { Observable } from 'rxjs';
import { ActionEvent } from '../models/action-event';
import { MatDialog, MatDialogConfig, DialogPosition, MatDialogRef } from '@angular/material';
import { ConfirmDialogComponent } from '../../dialog/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit{

  @Input('actionEvent')
  readonly actionEvent: Observable<ActionEvent>;

  @Input('session')
  readonly session: Session;

  @Input('checklists')
  readonly checklists: Checklist[];

  @Input('actions')
  readonly actions: Map<string, Action[]>;

  @Input('timer')
  readonly elapsedTime: number;

  /**
   * The event triggered when the close session button is pressed.
   * The value determines whether the session should be closed gracefully:
   *  - true: complete session
   *  - false: force session closing (it won't be saved nor completed)
   */
  @Output('onCloseButtonPressed')
  readonly onCloseButtonPressed = new EventEmitter<boolean>();

  //helpers
  globalProgress: number;
  progressData: ChecklistData[];

  constructor(private dialog: MatDialog) {}
  
  ngOnInit(): void {
    this.refreshData();

    //refresh data on new action created
    this.actionEvent.subscribe(i => {
      this.refreshData();
    });
  }

  /**
   * Triggered when the complete button is pressed.
   */
  completeSession(): void {
    this.showDialog({         
      title: 'Leave confirmation',
      message: 'Are you sure do you want to close the session?',
  }).afterClosed().subscribe(reply => {
      if (reply) {
        this.onCloseButtonPressed.emit(true);
      }
  });
  }

   /**
   * Triggered when the leave button is pressed.
   */
  leaveSession(): void {
      this.showDialog({         
          title: 'Leave confirmation',
          message: 'Are you sure do you want to leave the session without finishing it?',
      }).afterClosed().subscribe(reply => {
          if (reply) {
            this.onCloseButtonPressed.emit(false);
          }
      });
  }

  /**
   * Refreshes the data.
   */
  refreshData() {
    this.globalProgress = this.getGlobalProgress();
    this.progressData = this.getChecklistProgressData();
  }

  /**
   * Retrieves the global progress 
   * @returns The global progress in percentage
   */
  getGlobalProgress(): number {    
    let results = this.getChecklistsProgress();
    let sumOfAverages = results.map(i => (i.done / i.total)).reduce((prev, curr) => prev + curr);
    return sumOfAverages / results.length;
  }

  /**
   * Retrieves the checklist progress data to fill the summary table
   * @returns The list of checklist data
   */
  getChecklistProgressData(): ChecklistData[] {
    let results = this.getChecklistsProgress();
    let data = results.map(i => {    
        let checklist = this.checklists.find(c => c.id == i.checklistId);
        return <ChecklistData>{
          name: checklist.name,
          description: `${i.done}/${i.total}`,
          progress: i.done / i.total
      }
    });

    return data;
  }

  /**
   * Gets the progress percentage for each checklist.
   * @returns The array of checklist progress
   */
  private getChecklistsProgress(): ChecklistProgress[] {
    return this.checklists.map(i => {

      let done = 0;
      let requiredFields = i.steps.map(s => s.fields.filter(f => f.optional == false)).reduce((prev, next) => [...prev, ...next]);

      if (this.actions.has(i.id)) {
        done = this.actions.get(i.id).filter(i => requiredFields.find(f => f.id == i.field)).length;   
      }

      return <ChecklistProgress>{
        checklistId: i.id,
        done: done,
        total: requiredFields.length
      };
    });
  }

  /**
   * Shows a dialog.
   * @param data The data to be passed to the dialog.
   * @returns The mat dialog ref
   */
  private showDialog(data: { title: string, message: string }): MatDialogRef<ConfirmDialogComponent, boolean> {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true; 
    dialogConfig.data = data;
    return this.dialog.open(ConfirmDialogComponent, dialogConfig);
  }
}
