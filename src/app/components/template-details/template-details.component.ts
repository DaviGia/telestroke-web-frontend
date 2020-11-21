import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { TemplateService } from 'src/app/services/template.service';
import { switchMap, tap, mapTo, map, concatMap, toArray } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Template } from 'src/app/models/template';
import { Checklist } from 'src/app/models/checklist';
import { ChecklistService } from 'src/app/services/checklist.service';
import { UserInfo } from 'src/app/models/info/user-info';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-template-details',
  templateUrl: './template-details.component.html',
  styleUrls: ['./template-details.component.css']
})
export class TemplateDetailsComponent implements OnInit {

  templateInfo: Template;
  authorInfo: UserInfo;
  checklists$: Observable<Checklist[]>;

  constructor(private route: ActivatedRoute,
              private templateService: TemplateService,
              private userService: UsersService,
              private checklistService: ChecklistService) { }

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => this.templateService.getTemplate(params.get('id')))
    ).subscribe(t => { 
      this.userService.getUserInfo(t.author).subscribe(a => {
        this.templateInfo = t;
        this.authorInfo = a;
      })
      this.checklists$ = of(...t.phases.map(p => p.checklist)).pipe(
        concatMap(c => this.checklistService.getChecklist(c)),
        toArray()
      )
    });      
  }

}
