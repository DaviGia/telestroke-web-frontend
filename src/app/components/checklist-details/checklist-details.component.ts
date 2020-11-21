import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Checklist } from 'src/app/models/checklist';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { ChecklistService } from 'src/app/services/checklist.service';
import { UserInfo } from 'src/app/models/info/user-info';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-checklist-details',
  templateUrl: './checklist-details.component.html',
  styleUrls: ['./checklist-details.component.css']
})
export class ChecklistDetailsComponent implements OnInit {

  checklist: Checklist;
  authorInfo: UserInfo;

  constructor(private route: ActivatedRoute,
              private checklistService: ChecklistService,
              private userService: UsersService) { }

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.checklistService.getChecklist(params.get('id')))
    ).subscribe(c => {
      this.userService.getUserInfo(c.author).subscribe(a => {
        this.checklist = c;
        this.authorInfo = a;
      })     
    })
  }
}
