import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, mapTo, take } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Session } from '../models/session';
import { ConfigService } from '../services/config.service';
import { PageEvent } from '@angular/material';
import { isNullOrUndefined } from "util";
import { PageResponse } from '../models/response/page-response';
import { SessionInfo } from '../models/info/session-info';
import { Constants } from '../utils/constants';
import { BaseService } from './common/base.service';
import { CompleteSessionInfo } from '../models/info/complete-session-info';
import { Action } from '../models/action';
import { SessionFilter } from '../models/enums/session-filter';

@Injectable({
  providedIn: 'root'
})
export class SessionService extends BaseService {

  private readonly BaseRoute = "sessions";

  constructor(configService: ConfigService, 
              private http: HttpClient) {
    super(configService, 'stroke');
  }

  getSession(id: String): Observable<Session> {
    return this.http.get<Session>(`${this.baseUrl}/${this.BaseRoute}/${id}`)
    .pipe(
      take(1),
      catchError(this.handleError)
    );
  }

  getSessions(filter: SessionFilter = SessionFilter.None): Observable<Session[]> {

    var params;
    switch (filter) {
      case SessionFilter.Active: {
        params = new HttpParams().set(Constants.FilterQueryParamKey, 'active');
        break;
      }
      case SessionFilter.Ended: {
        params = new HttpParams().set(Constants.FilterQueryParamKey, 'ended');
        break;
      }
      default: {
        break;
      }
    }

    return this.http.get<Session[]>(`${this.baseUrl}/${this.BaseRoute}`, { params })
    .pipe(
      take(1),
      catchError(this.handleError)
    );
  }

  getSessionPage(event?: PageEvent): Observable<PageResponse<Session>> {
    var params;
    if (!isNullOrUndefined(event)) {
      params = new HttpParams()
        .set(Constants.PageQueryParamKey, event!!.pageIndex.toString())
        .set(Constants.PageLimitQueryParamKey, event!!.pageSize.toString());
    }
    return this.http.get<PageResponse<Session>>(`${this.baseUrl}/${this.BaseRoute}/${Constants.PaginationRoute}`, { params })
    .pipe(
      take(1),
      catchError(this.handleError)
    );
  }

  getSessionInfo(id: String): Observable<CompleteSessionInfo> {
    return this.http.get<CompleteSessionInfo>(`${this.baseUrl}/${this.BaseRoute}/info/${id}`)
    .pipe(
      take(1),
      catchError(this.handleError)
    );
  }

  getSessionsInfo(): Observable<SessionInfo[]> {
    return this.http.get<SessionInfo[]>(`${this.baseUrl}/${this.BaseRoute}/info`)
    .pipe(
      take(1),
      catchError(this.handleError)
    );
  }

  getSessionInfoPage(event?: PageEvent): Observable<PageResponse<SessionInfo>> {
    var params;
    if (!isNullOrUndefined(event)) {
      params = new HttpParams()
        .set(Constants.PageQueryParamKey, event!!.pageIndex.toString())
        .set(Constants.PageLimitQueryParamKey, event!!.pageSize.toString());
    }
    return this.http.get<PageResponse<SessionInfo>>(`${this.baseUrl}/${this.BaseRoute}/info/${Constants.PaginationRoute}`, { params })
    .pipe(
      take(1),
      catchError(this.handleError)
    );
  }

  createSession(sessionInfo: { specialist: string, operator: string, peerId: string, template: string }): Observable<Session> {
    return this.http.post<Session>(`${this.baseUrl}/${this.BaseRoute}`, sessionInfo)
    .pipe(
      take(1),
      catchError(this.handleError)
    );
  }

  addSessionAction(params: { sessionId: string, checklistId: string, action: Action }): Observable<boolean> {
    return this.http.put<any>(`${this.baseUrl}/${this.BaseRoute}/${params.sessionId}/checklist/${params.checklistId}/action`, params.action)
    .pipe(
      take(1),
      mapTo(true),
      catchError(this.handleError), 
      catchError(_ => of(false))
    );
  }

  closeSession(sessionId: string): Observable<boolean> {
    return this.http.post<any>(`${this.baseUrl}/${this.BaseRoute}/${sessionId}/close`, {})
    .pipe(
      take(1),
      mapTo(true),
      catchError(this.handleError), 
      catchError(_ => of(false))
    );
  }

  abortSession(sessionId: string): Observable<boolean> {
    return this.http.post<any>(`${this.baseUrl}/${this.BaseRoute}/${sessionId}/abort`, {})
    .pipe(
      take(1),
      mapTo(true),
      catchError(this.handleError), 
      catchError(_ => of(false))
    );
  }
}
