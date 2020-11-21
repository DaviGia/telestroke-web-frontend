import { ConfigService } from '../config.service';
import { Observable, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

export abstract class BaseService {

    /**
     * The base url.
     */
    protected baseUrl: String;

    /**
     * Main constructor
     * @param configService The config service.
     * @param baseApiUrl The base api url.
     */
    constructor(configService: ConfigService, baseApiUrl: String) {
      this.baseUrl = `${configService.getConfig().baseUrl}/${baseApiUrl}`
    }

    /**
     * Handle Http operation that failed.
     * @param error The error object.
     * @returns Rethrow the error in the pipeline.
     */
    protected handleError(error: any): Observable<any> {

        if (error instanceof HttpErrorResponse) {
          console.error(`Http error: ${error.message}`);
        } else {
          let errMsg = error.message || 'unknown';
          console.error(`Error detected: ${errMsg}`);
        }
        
        return throwError(error);
    }
}