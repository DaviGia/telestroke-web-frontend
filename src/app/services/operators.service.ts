import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, mapTo, take } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Operator } from '../models/operator';
import { ConfigService } from './config.service'
import { BaseService } from './common/base.service';
import { PageEvent } from '@angular/material';
import { PageResponse } from '../models/response/page-response';
import { OperatorInfo } from '../models/info/operator-info';
import { isNullOrUndefined } from 'util';
import { Constants } from '../utils/constants';

@Injectable({
  providedIn: 'root'
})
export class OperatorsService extends BaseService {

  private readonly BaseRoute = "peers";

  constructor(configService: ConfigService,
              private http: HttpClient) {
    super(configService, 'peer');
  }

  getOperator(id: string): Observable<Operator> {
    return this.http.get<Operator>(`${this.baseUrl}/${this.BaseRoute}/${id}`)
    .pipe(
      take(1),
      catchError(this.handleError)
    );
  }

  getOperators(): Observable<Operator[]> {
    return this.http.get<Operator[]>(`${this.baseUrl}/${this.BaseRoute}`)
    .pipe(
      take(1),
      catchError(this.handleError)
    );
  }

  getOperatorPage(event?: PageEvent): Observable<PageResponse<Operator>> {
    var params;
    if (!isNullOrUndefined(event)) {
      params = new HttpParams()
        .set(Constants.PageQueryParamKey, event!!.pageIndex.toString())
        .set(Constants.PageLimitQueryParamKey, event!!.pageSize.toString());
    }
    return this.http.get<PageResponse<Operator>>(`${this.baseUrl}/${this.BaseRoute}/info/${Constants.PaginationRoute}`, { params })
    .pipe(
      take(1),
      catchError(this.handleError)
    );
  }

  getOperatorInfo(id: string): Observable<OperatorInfo> {
    return this.http.get<OperatorInfo>(`${this.baseUrl}/${this.BaseRoute}/info/${id}`)
    .pipe(
      take(1),
      catchError(this.handleError)
    );
  }

  getOperatorsInfo(filterFree: boolean = false): Observable<OperatorInfo[]> {

    var params;
    if (filterFree) {
      params = new HttpParams().set(Constants.FilterQueryParamKey, 'free');
    }

    return this.http.get<OperatorInfo[]>(`${this.baseUrl}/${this.BaseRoute}/info`, { params })
    .pipe(
      take(1),
      catchError(this.handleError)
    );
  }

  getOperatorInfoPage(event?: PageEvent): Observable<PageResponse<OperatorInfo>> {
    var params;
    if (!isNullOrUndefined(event)) {
      params = new HttpParams()
        .set(Constants.PageQueryParamKey, event!!.pageIndex.toString())
        .set(Constants.PageLimitQueryParamKey, event!!.pageSize.toString());
    }
    return this.http.get<PageResponse<OperatorInfo>>(`${this.baseUrl}/${this.BaseRoute}/info/${Constants.PaginationRoute}`, { params })
    .pipe(
      take(1),
      catchError(this.handleError)
    );
  }

  addOperator(peer: { id: string, userId: string, description: string }): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/${this.BaseRoute}`, peer)
      .pipe(
        take(1),
        mapTo(true),
        catchError(this.handleError),
        catchError(_ => of(false))
      );
  }
}