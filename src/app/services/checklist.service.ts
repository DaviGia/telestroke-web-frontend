import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Checklist } from '../models/checklist';
import { ConfigService } from '../services/config.service'
import { PageEvent } from '@angular/material';
import { PageResponse } from '../models/response/page-response';
import { isNullOrUndefined } from 'util';
import { Constants } from '../utils/constants';
import { BaseService } from './common/base.service';

@Injectable({
  providedIn: 'root'
})
export class ChecklistService extends BaseService {

  private readonly BaseRoute = "checklists";

  constructor(configService: ConfigService, private http: HttpClient) {
    super(configService, 'stroke');
  }

  getChecklists(): Observable<Checklist[]> {
    return this.http.get<Checklist[]>(`${this.baseUrl}/${this.BaseRoute}`)
      .pipe(
        take(1),
        catchError(this.handleError)
      );
  }

  getChecklist(id: String): Observable<Checklist> {
    return this.http.get<Checklist>(`${this.baseUrl}/${this.BaseRoute}/${id}`)
      .pipe(
        take(1),
        catchError(this.handleError)
      );
  }

  getChecklistPage(event?: PageEvent): Observable<PageResponse<Checklist>> {
    var params;
    if (!isNullOrUndefined(event)) {
      params = new HttpParams()
        .set(Constants.PageQueryParamKey, event!!.pageIndex.toString())
        .set(Constants.PageLimitQueryParamKey, event!!.pageSize.toString());
    }
    return this.http.get<PageResponse<Checklist>>(`${this.baseUrl}/${this.BaseRoute}/${Constants.PaginationRoute}`, { params })
    .pipe(
      take(1),
      catchError(this.handleError)
    );
  }
}