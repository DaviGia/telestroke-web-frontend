import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MomentModule } from 'ngx-moment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { SessionComponent } from './components/session/session.component';
import { OperatorsListComponent } from './components/operators-list/operators-list.component';
import { SessionsListComponent } from './components/sessions-list/sessions-list.component';
import { CreateSessionComponent } from './components/create-session/create-session.component';
import { ChecklistsListComponent } from './components/checklists-list/checklists-list.component';
import { SessionDetailsComponent } from './components/session-details/session-details.component';
import { TemplatesListComponent } from './components/templates-list/templates-list.component';

import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ConfigService } from './services/config.service';
import { ChecklistDetailsComponent } from './components/checklist-details/checklist-details.component';
import { TemplateDetailsComponent } from './components/template-details/template-details.component';
import { SessionPhaseComponent } from './components/session-details/session-phase/session-phase.component';
import { ChecklistStepComponent } from './components/checklist-details/checklist-step/checklist-step.component';
import { ChecklistComponent } from './components/session/checklist/checklist.component';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { SummaryComponent } from './components/session/summary/summary.component';
import { ChecklistResultComponent } from './components/checklist-details/checklist-result/checklist-result.component';
import { ChecklistResultFieldsComponent } from './components/checklist-details/checklist-result-fields/checklist-result-fields.component';
import { ConfirmDialogComponent } from './components/dialog/confirm-dialog/confirm-dialog.component';
import { ChooseDialogComponent } from './components/dialog/choose-dialog/choose-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    CreateSessionComponent,
    SessionComponent,
    SessionsListComponent,
    TemplatesListComponent,
    OperatorsListComponent,
    ChecklistsListComponent,  
    SessionDetailsComponent, 
    ChecklistDetailsComponent,
    TemplateDetailsComponent,
    SessionPhaseComponent,
    ChecklistStepComponent,
    ChecklistComponent,
    SummaryComponent,
    ChecklistResultComponent,
    ChecklistResultFieldsComponent,
    ConfirmDialogComponent,
    ChooseDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    MomentModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MaterialModule,
    FlexLayoutModule
  ],
  entryComponents: [
    ConfirmDialogComponent,
    ChooseDialogComponent
  ],
  providers: [
    { 
      provide: APP_INITIALIZER,
      useFactory: (configService: ConfigService) => () => configService.load(),
      deps: [ConfigService],
      multi: true 
    },  
    { 
      provide: HTTP_INTERCEPTORS, 
      useClass: AuthInterceptor, 
      multi: true 
    },
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
