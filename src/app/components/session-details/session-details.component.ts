import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { SessionService } from 'src/app/services/session.service';
import { switchMap } from 'rxjs/operators';
import { CompleteSessionInfo } from 'src/app/models/info/complete-session-info';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-session-details',
  templateUrl: './session-details.component.html',
  styleUrls: ['./session-details.component.css']
})
export class SessionDetailsComponent implements OnInit {

  sessionInfo: CompleteSessionInfo;
  continueButtonEnabled: boolean = false;

  constructor(private route: ActivatedRoute,
              private sessionService: SessionService,
              private authService: AuthService) { }

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.sessionService.getSessionInfo(params.get('id')))
    ).subscribe(i => {
      this.sessionInfo = i;
      let user = this.authService.getCurrentUser();
      this.continueButtonEnabled = user.id == i.specialist.id && !i.endDate;
    });
  }
}
