import { Component } from '@angular/core';
import { ListComponent } from '../common/list.component';
import { PageEvent } from '@angular/material';
import { OperatorsService } from 'src/app/services/operators.service';
import { OperatorInfo } from 'src/app/models/info/operator-info';

@Component({
  selector: 'app-operators-list',
  templateUrl: './operators-list.component.html',
  styleUrls: ['./operators-list.component.css']
})
export class OperatorsListComponent extends ListComponent<OperatorInfo> {

  constructor(private operatorsService: OperatorsService) {
    super();
  }

  fetchData(event?: PageEvent) {
    return this.operatorsService.getOperatorInfoPage(event); 
  }
}
