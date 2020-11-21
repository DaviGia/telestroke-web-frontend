import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ConfigService } from '../services/config.service'
import { User } from '../models/user';
import { BaseService } from './common/base.service';
import { UserInfo } from '../models/info/user-info';

@Injectable({
  providedIn: 'root'
})
export class UsersService extends BaseService {

  private readonly BaseRoute = "users";

  constructor(configService: ConfigService, private http: HttpClient) {
    super(configService, 'stroke');
  }

  getUserInfo(id: String): Observable<UserInfo> {
    return this.http.get<UserInfo>(`${this.baseUrl}/${this.BaseRoute}/${id}`)
    .pipe(
      take(1),
      catchError(this.handleError)
    );
  }
}