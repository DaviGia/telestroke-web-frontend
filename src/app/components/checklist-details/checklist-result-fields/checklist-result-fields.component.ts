import { Component, OnInit, Input } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material';
import { Result } from 'src/app/models/result';
import { Checklist } from 'src/app/models/checklist';

/** Node model */
interface ResultTargetNode {
  name: string;
  children?: ResultTargetNode[];
}

/** Flat node with expandable and level information */
interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  selector: 'app-checklist-result-fields',
  templateUrl: './checklist-result-fields.component.html',
  styleUrls: ['./checklist-result-fields.component.css']
})
export class ChecklistResultFieldsComponent implements OnInit {

  @Input('result')
  result: Result;

  @Input('checklist')
  checklist: Checklist;

  //helpers
  private _transformer = (node: ResultTargetNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
    };
  }

  treeControl = new FlatTreeControl<FlatNode>(node => node.level, node => node.expandable);
  treeFlattener = new MatTreeFlattener(this._transformer, node => node.level, node => node.expandable, node => node.children);
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor() { }

  ngOnInit() {
    this.dataSource.data = this.checklist.steps.map(s => { 
      
      let targetFields = s.fields.filter(i => i.references.includes(this.result.targetField))

      return <ResultTargetNode>{
        name: s.name,
        children: targetFields.filter(i => i.references).map(f => <ResultTargetNode>{ name: f.name })
      };
    });
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;
}
