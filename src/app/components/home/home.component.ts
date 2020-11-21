import { Component, OnInit } from '@angular/core';
import { Observable, of, throwError, forkJoin } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { SessionService } from '../../services/session.service';
import { TemplateService } from 'src/app/services/template.service';
import { ChecklistService } from 'src/app/services/checklist.service';
import { OperatorsService } from 'src/app/services/operators.service';

import { User } from 'src/app/models/user';
import { Session } from 'src/app/models/session';
import { Checklist } from 'src/app/models/checklist';
import { Template } from 'src/app/models/template';
import { Operator } from 'src/app/models/operator';
import { catchError, tap, mapTo, switchMap } from 'rxjs/operators';
import { MatSnackBar, MatDialogConfig, MatDialog } from '@angular/material';
import { NavigationExtras, Router } from '@angular/router';
import { ChooseDialogComponent, SelectItem } from '../dialog/choose-dialog/choose-dialog.component';
import { OperatorInfo } from 'src/app/models/info/operator-info';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  user: User;
  sessions: Session[] = [];
  checklists: Checklist[] = [];
  templates: Template[] = [];
  operators: Operator[] = [];
  activeOperators: OperatorInfo[] = [];

  loading: boolean = true;
  error: string = '';

  constructor(private router: Router,
              private snackBar: MatSnackBar,
              private dialog: MatDialog,
              private authService: AuthService,
              private sessionService: SessionService,
              private templateService: TemplateService,
              private checklistService: ChecklistService,
              private operatorsService: OperatorsService) { }

  ngOnInit() {
    this.user = this.authService.getCurrentUser();

    forkJoin({
      sessions: this.sessionService.getSessions(),
      checklists: this.checklistService.getChecklists(),
      templates: this.templateService.getTemplates(),
      operators: this.operatorsService.getOperators(),
      activeOperators: this.operatorsService.getOperatorsInfo(true)
    }).pipe(
      tap(results => {
        this.sessions = results.sessions;
        this.checklists = results.checklists;
        this.templates = results.templates;
        this.operators = results.operators;
        this.activeOperators = results.activeOperators;
      }),
      mapTo(true),
      catchError(_ => {
        this.snackBar.open('Service unavailable, retry again later!', 'ok');
        this.error = 'Service not available';
        return of(false);
      })
    ).subscribe(_ => {
      this.loading = false;
    });
  }

  /**
   * Begins a new session with a specific operator
   * @param peerId The peer id
   */
  beginSession(peerId: string) {
    this.openChooseTemplateDialog().subscribe(selectedTemplateId => {

      if (selectedTemplateId == '') { return; }

      let specialistId = this.user.id;
      let templateId = selectedTemplateId;
      let operator = this.operators.find(i => i.id == peerId);

      if (!operator) {
        this.showSnackBar("Selected operator is no more active");
        return;
      }

      this.sessionService.createSession({ 
        specialist: specialistId,
        operator: operator.userId,
        peerId: peerId,
        template: templateId
      })
      .pipe(
        catchError(err => {
          this.showSnackBar(err.statusText);
          return throwError(err);
        })
      ).subscribe(session => {
        //sending peer id in the navigation extras
        let extras: NavigationExtras = {
            state: {
                peerId: peerId
            }
        };
        this.router.navigate([`session/${session.id}`], extras);
      });
    });     
  }

  refreshOperators(): void {
    forkJoin({
      activeOperators: this.operatorsService.getOperatorsInfo(true),
      operators: this.operatorsService.getOperators()
    }).subscribe(results => {
      this.activeOperators = results.activeOperators;
      this.operators = results.operators;
      this.showSnackBar("Operators refresh completed");
    });
  }

  /**
   * Opens the choose dialog to let user select the template.
   */
  private openChooseTemplateDialog(): Observable<string> {

    return this.templateService.getTemplates().pipe(
      switchMap(templates => {       
        let availableTemplates = templates.map(i => 
          <SelectItem> { 
            label: `${i.name} (${i.description})`, 
            value: i.id
        });
    
        let config = new MatDialogConfig();
        config.disableClose = true;
        config.autoFocus = true; 
        config.data = {
          title: 'Choose a template',
          label: 'Available templates',
          message: 'Please choose a template to begin the session',
          items: availableTemplates
        };
        
        return this.dialog.open(ChooseDialogComponent, config).afterClosed().pipe(
          switchMap((selected: string) => {
            if (selected) {
              return of(selected);
            } else {
              this.showSnackBar('No template selected, unable to start session');
              return of('');
            }
          })
        );
      }),
      catchError(_ => of(''))
    );  
  }

  /**
   * Shows the snackbar.
   * @param message The message
   */
  private showSnackBar(message: string) {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }
}
