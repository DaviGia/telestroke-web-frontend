import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, mapTo, tap, take } from 'rxjs/operators';
import { ConfigService } from '../services/config.service';
import { User } from '../models/user';
import { RefreshResponse } from '../models/response/refresh-response';
import { LoginResponse } from '../models/response/login-response'
import { BaseService } from './common/base.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseService {

  private readonly JWT_TOKEN = 'jwtToken';
  private readonly REFRESH_TOKEN = 'refreshToken';
  private readonly CURRENT_USER = 'user';

  private loginStatus$ = new BehaviorSubject<boolean>(false);
  private user$ = new BehaviorSubject<User>(null);

  constructor(configService: ConfigService, 
              private http: HttpClient) {
    super(configService, 'auth');
  }

  /**
   * Executes login.
   * @param credentials The credentials
   * @returns True, if the operation was successful; otherwise false.
   */
  login(credentials: { username: string, password: string }): Observable<boolean> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials)
      .pipe(
        take(1),
        tap(response => this.doLoginUser(response.user, { token: response.token, refreshToken: response.refreshToken })),
        mapTo(true),
        catchError(this.handleError) //do not swallow the error, the error message needs to be displayed to the user
      );
  }

  /**
   * Executes logout.
   * @returns True, if the operation was successful; otherwise false.
   */
  logout(): Observable<boolean> {
    return this.http.post<any>(`${this.baseUrl}/logout`, {
      refreshToken: this.getRefreshToken()
    }).pipe(
      take(1),
      tap(() => this.doLogoutUser()),
      mapTo(true),
      catchError(this.handleError),
      catchError(_ => {
        //logout anyway even on error
        this.doLogoutUser();
        return of(false);
      })
    );
  }

  /**
   * Executes the token refresh.
   * @returns True, if a user is logged in; otherwise false.
   */
  refreshToken(): Observable<boolean> {
    return this.http.post<RefreshResponse>(`${this.baseUrl}/refresh`, {
      token: this.getJwtToken(),
      refreshToken: this.getRefreshToken()
    }).pipe(
      take(1),
      tap((response) => this.storeTokens({ token: response.token, refreshToken: response.refreshToken })),
      mapTo(true),
      catchError(error => {
        this.doLogoutUser();
        return throwError(error);
      }),
      catchError(_ => of(false))
    );
  }

  /**
   * Clears the current login data.
   */
  clear(): void {
    this.doLogoutUser();
  }

 /**
  * Gets the JWT token.
  * @returns The JWT token.
  */
  getJwtToken(): string {
    return localStorage.getItem(this.JWT_TOKEN);
  }

  /**
   * Determines whether the a user is logged in or not.
   * @returns True, if a user is logged in; otherwise false.
   */
  getLoginStatus(): boolean {
    return !!this.getJwtToken();
  }

  /**
   * Observes the login status.
   * @returns An observable to observe the login status.
   */
  observeLoginStatus(): Observable<boolean> {
    return this.loginStatus$.asObservable();
  }

  /**
   * Gets the current user information.
   * @returns The user information.
   */
  getCurrentUser(): User {
    return JSON.parse(localStorage.getItem(this.CURRENT_USER)) as User;
  }

  /**
   * Observes the current user information.
   * @returns An observable to observe the current user information.
   */
  observeCurrentUser(): Observable<User> {
    if (this.user$.value == null) {
      this.user$.next(this.getCurrentUser());
    }
    return this.user$;
  }

  private doLoginUser(user: User, tokens: { token: string, refreshToken: string }) {
    this.storeUser(user);
    this.storeTokens(tokens);
    this.loginStatus$.next(true);
    this.user$.next(this.getCurrentUser());
  }

  private doLogoutUser() {
    this.removeUser();
    this.removeTokens();
    this.loginStatus$.next(false);
    this.user$.next(null);
  }

  private getRefreshToken(): string {
    return localStorage.getItem(this.REFRESH_TOKEN);
  }

  private storeTokens(tokens: { token: string, refreshToken: string }) {
    localStorage.setItem(this.JWT_TOKEN, tokens.token);
    localStorage.setItem(this.REFRESH_TOKEN, tokens.refreshToken);
  }

  private storeUser(user: User) {
      localStorage.setItem(this.CURRENT_USER, JSON.stringify(user));
  }

  private removeTokens() {
    localStorage.removeItem(this.JWT_TOKEN);
    localStorage.removeItem(this.REFRESH_TOKEN);
  }

  private removeUser() {
    localStorage.removeItem(this.CURRENT_USER);
  }
}
