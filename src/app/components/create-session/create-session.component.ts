import { Component, OnInit } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Template } from 'src/app/models/template';
import { SessionService } from 'src/app/services/session.service';
import { TemplateService } from 'src/app/services/template.service';
import { OperatorsService } from 'src/app/services/operators.service';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { OperatorInfo } from 'src/app/models/info/operator-info';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-create-session',
  templateUrl: './create-session.component.html',
  styleUrls: ['./create-session.component.css']
})
export class CreateSessionComponent implements OnInit {

  form: FormGroup;

  specialist: User;
  templates$: Observable<Template[]>;
  operators$: Observable<OperatorInfo[]>;

  loading = false;
  error = '';

  constructor(private router: Router,
              private sessionService: SessionService,
              private authService: AuthService,
              private templateService: TemplateService,
              private operatorService: OperatorsService) { }

  ngOnInit() {
    this.specialist = this.authService.getCurrentUser();

    this.form = new FormGroup({
      specialist: new FormControl({ value: `${this.specialist.firstName} ${this.specialist.lastName} (${this.specialist.username})`, disabled: true }),
      peerId: new FormControl('', Validators.required),
      template: new FormControl('', Validators.required)
    });

    this.updateCollections();
  }

  onSubmit() {

    if (this.form.invalid) {
      this.markInvalidField(this.form);
      return;
    }

    this.loading = true;
    this.operators$.subscribe(operators => {

      let specialistId = this.specialist.id;
      let templateId = this.form.controls.template.value;
      let peerId = this.form.controls.peerId.value;
      let operator = operators.find(i => i.id == peerId);

      if (!operator) {
        this.handleError('Operator not found');
        return;
      }

      this.sessionService.createSession({ 
        specialist: specialistId,
        operator: operator.user.id,
        peerId: peerId,
        template: templateId
      })
      .pipe(
        catchError(err => {
          this.handleError(err.statusText);
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

  private handleError(errorMessage: string) {
    this.error = errorMessage;
    this.loading = false;
    this.resetErrors();
    this.updateCollections();
  }

  private updateCollections() {
    this.templates$ = this.templateService.getTemplates()
    this.operators$ = this.operatorService.getOperatorsInfo(true);
  }

  private markInvalidField(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
        const control = formGroup.get(field);           
        if (control instanceof FormControl) {           
            control.markAsTouched({ onlySelf: true });
        } else if (control instanceof FormGroup) {      
            this.markInvalidField(control);           
        }
    });
  }

  private resetErrors() {
    setTimeout(() => {
        this.error = '';
    }, 3000);
  }
}
