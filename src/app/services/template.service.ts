import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Template } from '../models/template';
import { ConfigService } from '../services/config.service';
import { PageEvent } from '@angular/material';
import { PageResponse } from '../models/response/page-response';
import { isNullOrUndefined } from 'util';
import { Constants } from '../utils/constants';
import { BaseService } from './common/base.service';

@Injectable({
  providedIn: 'root'
})
export class TemplateService extends BaseService {

  private readonly BaseRoute = "templates";

  constructor(configService: ConfigService, private http: HttpClient) {
    super(configService, 'stroke');
  }

  getTemplates(): Observable<Template[]> {
    return this.http.get<Template[]>(`${this.baseUrl}/${this.BaseRoute}`)
    .pipe(
      take(1),
      catchError(this.handleError)
    );
  }

  getTemplate(id: String): Observable<Template> {
    return this.http.get<Template>(`${this.baseUrl}/${this.BaseRoute}/${id}`)
    .pipe(
      take(1),
      catchError(this.handleError)
    );
  }

  getTemplatePage(event?: PageEvent): Observable<PageResponse<Template>> {
    var params;
    if (!isNullOrUndefined(event)) {
      params = new HttpParams()
        .set(Constants.PageQueryParamKey, event!!.pageIndex.toString())
        .set(Constants.PageLimitQueryParamKey, event!!.pageSize.toString());
    }
    return this.http.get<PageResponse<Template>>(`${this.baseUrl}/${this.BaseRoute}/${Constants.PaginationRoute}`, { params })
    .pipe(
      take(1),
      catchError(this.handleError)
    );
  }
}
