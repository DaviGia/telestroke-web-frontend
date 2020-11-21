import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { catchError } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

    //main field
    form: FormGroup;

    //support field
    loading = false;
    error = '';

    //private field
    private returnUrl: string;
  
    constructor(private route: ActivatedRoute,
                private router: Router,
                private authService: AuthService) {
                    
        // redirect to home if already logged in
        if (this.authService.getLoginStatus()) { 
            this.router.navigate(['/']);
        }
    }
  
    ngOnInit() {
        this.form = new FormGroup({
          username: new FormControl('', Validators.required),
          password: new FormControl('', Validators.required)
        });
  
        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }
  
    /**
     * Triggered on form submit
     */
    onSubmit() {
        
        // stop here if form is invalid
        if (this.form.invalid) {
            this.markInvalidField(this.form);
            return;
        }
  
        this.loading = true;
        this.authService.login({ 
            username: this.form.controls.username.value, 
            password: this.form.controls.password.value 
        }).pipe(
            catchError(err => {
                this.error = err.statusText;
                this.loading = false;
                this.resetErrors();
                return throwError(err);
            })
        ).subscribe(result => {
            if (result) {
                this.router.navigate([this.returnUrl]);
            }
        });
    }

    /**
     * Recursively force all invalid field in the group to show error.
     * @param formGroup The form group
     */
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

    /**
     * Resets the error text after a while.
     */
    private resetErrors() {
        setTimeout(() => {
            this.error = '';
        }, 3000);
    }
}
