import { Component } from '@angular/core';
import { PageEvent } from '@angular/material';
import { Template } from 'src/app/models/template';
import { TemplateService } from 'src/app/services/template.service';
import { ListComponent } from '../common/list.component';

@Component({
  selector: 'app-templates-list',
  templateUrl: './templates-list.component.html',
  styleUrls: ['./templates-list.component.css']
})
export class TemplatesListComponent extends ListComponent<Template> {
  
  constructor(private templateService: TemplateService) {
    super();
  }

  fetchData(event?: PageEvent) {
    return this.templateService.getTemplatePage(event);   
  }
}
