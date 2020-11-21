import { Component } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { PageEvent } from '@angular/material/paginator';
import { ListComponent } from '../common/list.component';
import { SessionInfo } from 'src/app/models/info/session-info';

@Component({
  selector: 'app-sessions-list',
  templateUrl: './sessions-list.component.html',
  styleUrls: ['./sessions-list.component.css']
})
export class SessionsListComponent extends ListComponent<SessionInfo> {

  constructor(private sessionService: SessionService) { super(); }

  /**
   * Fetches the results for the selected page.
   * @param event The page event
   */
  public fetchData(event?: PageEvent) {
    return this.sessionService.getSessionInfoPage(event);
  }
}