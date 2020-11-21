import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent } from './components/home/home.component';

import { CreateSessionComponent } from './components/create-session/create-session.component';
import { SessionsListComponent } from './components/sessions-list/sessions-list.component';
import { ChecklistsListComponent } from './components/checklists-list/checklists-list.component';
import { SessionDetailsComponent } from './components/session-details/session-details.component';
import { TemplatesListComponent } from './components/templates-list/templates-list.component';
import { OperatorsListComponent } from './components/operators-list/operators-list.component';
import { SessionComponent } from './components/session/session.component';
import { ChecklistDetailsComponent } from './components/checklist-details/checklist-details.component';
import { TemplateDetailsComponent } from './components/template-details/template-details.component';
import { NavigationGuard } from './guards/navigation.guard';

const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'session/create', component: CreateSessionComponent },
  { path: 'session/:id', component: SessionComponent, canDeactivate: [NavigationGuard] },
  { path: 'sessions', component: SessionsListComponent },
  { path: 'sessions/:id', component: SessionDetailsComponent },
  { path: 'checklists', component: ChecklistsListComponent },
  { path: 'checklists/:id', component: ChecklistDetailsComponent },
  { path: 'templates', component: TemplatesListComponent },
  { path: 'templates/:id', component: TemplateDetailsComponent },
  { path: 'operators', component: OperatorsListComponent },

  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
