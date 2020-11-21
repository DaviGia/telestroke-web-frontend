import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';

import { AuthService } from './services/auth.service';

import { User } from './models/user';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { LocationStrategy } from '@angular/common';
import { NavigationService } from './services/navigation.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  user: Observable<User>;
  toolbarVisible: boolean = true;

  constructor(private router: Router, 
              private authService: AuthService,
              private snackBar: MatSnackBar) {

    this.user = this.authService.observeCurrentUser();
  }

  logout() {
    let self = this;
    this.authService.logout()
    .pipe(
      catchError(err => {
        let errorMessage = 'Unknown error occurred';
        if (err instanceof HttpErrorResponse) {
          errorMessage = err.message || err.statusText;
        }
        this.snackBar.open(errorMessage, 'Ok', { duration: 3000 });
        return throwError(err);
      })
    )
    .subscribe(_ => {
      //navigate to login page (even on error)
      self.router.navigate(['/login']);
    })
  }

  /**
   * Changes the toolbar visibility.
   * @param visible Whether the toolbar should be visible or not.
   */

  public changeToolbarVisibility(visible: boolean) {
    this.toolbarVisible = visible;
  }
}
