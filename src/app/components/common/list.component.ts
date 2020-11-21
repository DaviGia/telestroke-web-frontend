import { BehaviorSubject, Observable, of } from 'rxjs';
import { PageEvent } from '@angular/material';
import { OnInit } from '@angular/core';
import { PageResponse } from 'src/app/models/response/page-response';
import { map, catchError, take } from 'rxjs/operators';

export abstract class ListComponent<T> implements OnInit {

    /**
     * The previous page event.
     */
    pageEvent: PageEvent;
    /**
     * The current page index.
     */
    pageIndex: number = 0;
    /**
     * The current page size.
     */
    pageSize: number = 20;
    /**
     * The total number of elements.
     */
    length: number;
    /**
     * The current data.
     */
    data: T[] = [];
    /**
     * Determines whether to show spinner or not.
     */
    loading: boolean = false;
    /**
     * Variable that holds the error message.
     */
    error: string = '';

    ngOnInit() {
        this.handlePageEvent(null);
    }
  
    /**
     * Fetches the results for the selected page.
     * @param event The page event
     */
    handlePageEvent(event?: PageEvent): void {
        this.loading = true;
        this.fetchData(event).pipe(
          take(1),
          map(i => {
            this.length = i.total as number;
            this.pageIndex = i.page as number;
            this.pageSize = i.limit as number;
            return i.data;
          }),
          catchError(err => {
            this.error = err.statusText || err.message || err;
            return of(<T[]>[]);
          })
        ).subscribe(i => {
          this.loading = false;
          this.data = i;
        }); 
    };

    /**
     * Fetches the data for the selected page.
     * @param event The page event
     * @returns An observable of a page response
     */
    abstract fetchData(event?: PageEvent): Observable<PageResponse<T>>;
  }