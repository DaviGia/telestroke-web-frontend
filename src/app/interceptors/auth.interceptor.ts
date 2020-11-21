import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  /**
   * Determines whether the token refresh is in progress.
   */
  private isRefreshing = false;
  /**
   * Observable used to fire all cached requests when the new token is available.
   */
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService,
              private router: Router) { }

  /**
   * Intercepts HTTP requests, adds the token (if present) and handles authorization errors
   * @param request The request
   * @param next The next request
   * @returns An observable http event
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    let token = this.authService.getJwtToken();
    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(catchError(error => {
      if (this.isTokenExpired(request, error)) {
        return this.handleTokenExpiration(request, next);
      } else {
        return throwError(error);
      }
    }));
  }

  /**
   * Adds the JWT token in the request header.
   * @param request The request
   * @param token The JWT token
   * @returns The request with the authorization token in the header
   */
  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  /**
   * Handles the token expiration (caches requests and tries to refresh the JWT token).
   * @param request The request
   * @param next The next request
   * @returns An observable http event
   */
  private handleTokenExpiration(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {

      //all subsequential requests will be cached until a refreshTokenSubject is empty
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      //requests token refresh
      return this.authService.refreshToken().pipe(
        switchMap(result => {
          if (result) {
            //jwt token refreshed, fire all cached failed requests
            return of(this.authService.getJwtToken());
          } else {
            //if the refresh token is expired, redirect to login page and make the user to log again
            this.authService.clear();
            this.router.navigate(['/login']);
            return this.authService.observeLoginStatus().pipe(
              filter(status => status == true),
              take(1),
              switchMap(_ => of(this.authService.getJwtToken()))      
            );   
          }
        }),
        switchMap(token => {
          //unlock cached requests
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token);
          return next.handle(this.addToken(request, token));
        })
      );
    } else {
      //cache request
      return this.refreshTokenSubject.pipe(
        filter(token => !token), //wait until a new token is available
        take(1),
        switchMap(token => {
          return next.handle(this.addToken(request, token));
        })
      );
    }
  }

  /**
   * Determines whether the error refers to an expired token or not.
   * @param request The original request
   * @param error The error
   */
  private isTokenExpired(request: HttpRequest<any>, error: any): Boolean {
    return error instanceof HttpErrorResponse && error.status === 401 && 
      !request.url.endsWith('/api/auth/login') && !request.url.endsWith('/api/auth/refresh');
  }
}