import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Checklist } from 'src/app/models/checklist';
import { Validators, FormControl, FormGroup } from '@angular/forms';
import { Field } from 'src/app/models/field';
import { FieldType } from 'src/app/models/enums/field-type';
import { FieldValueType } from 'src/app/models/enums/field-value-type';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatHorizontalStepper } from '@angular/material';
import { Action } from 'src/app/models/action';
import { ActionEvent } from '../models/action-event';
import { StrategyType } from 'src/app/models/enums/strategy-type';
import { BehaviorSubject } from 'rxjs';
import { String as StringFormatter } from 'typescript-string-operations';
import moment from 'moment';

@Component({
  selector: 'app-checklist',
  templateUrl: './checklist.component.html',
  styleUrls: ['./checklist.component.css']
})
export class ChecklistComponent implements OnInit {

  /**
   * The list of action performed by the user.
   */
  @Input('actions')
  readonly actions: Map<string, Action[]>;
  /**
   * The checklist.
   */
  @Input('checklist')
  readonly checklist: Checklist;
  /**
   * The timer that represents the elapsed time from the beginning of the session.
   */
  @Input('timer')
  readonly timer: number;

  /**
   * The event triggered when the user fill a step with valid values and changes the step.
   */
  @Output('onActionDone')
  readonly onActionDone = new EventEmitter<ActionEvent>();

  /**
   * The event triggered when the checklist continue button is pressed.
   */
  @Output('onChecklistCompleted')
  readonly onChecklistCompleted = new EventEmitter<boolean>();

  @ViewChild('stepper', { static: false })
  readonly stepper: MatHorizontalStepper;

  //HELPERS

  /**
   * Whether to enable linear mode or not.
   */
  linearMode: boolean = true;
  /**
   * The array of formgroups, one for each step.
   */
  formGroups: FormGroup[];
  /**
   * The observable array of result strings.
   */
  results = new BehaviorSubject<string[]>([]);

  constructor() { }

  ngOnInit() {
    this.formGroups = this.buildFormGroups();

    //disables linear mode if previous actions are available
    this.checkPreviousActions();
    //update results
    this.updateResults();
  }

  /**
   * Handles the continue button click event.
   */
  continueClicked() {
    let item = this.stepper.selected;
    let itemIndex = this.stepper.selectedIndex;

    this.selectionChanged({ previouslySelectedIndex: itemIndex, previouslySelectedStep: item } as StepperSelectionEvent);

    //unlock next checklist
    this.onChecklistCompleted.emit(true);
  }

  /**
   * Handles the changed step event.
   * @param event The stepper selection event
   */
  selectionChanged(event: StepperSelectionEvent) {
    let control = event.previouslySelectedStep.stepControl;

    if (!control.dirty) {
      console.log("value has not been changed, avoid http request");
      return;
    }

    //if the value is correct
    if (control.valid && control.enabled) {

      const stepIndex = event.previouslySelectedIndex;
      const step = this.checklist.steps[stepIndex];

      const actions = step.fields.map(f => {
        const fieldId = f.id;
        const fieldControl = control.get(fieldId);
        let fieldValue = fieldControl.value;

        if (fieldControl.valid && fieldControl.dirty) {
          
          //if the value is datetime parse the string into milliseconds 
          if (f.constraints.valueType == FieldValueType.Datetime) {
            const parsedValue = moment(fieldValue, moment.HTML5_FMT.DATETIME_LOCAL);
            fieldValue = parsedValue.valueOf();
          }

          return new Action(step.id, fieldId, fieldValue);
        } else {
          return null;
        }
      }).filter(i => i);

      //emit correct actions
      actions.forEach(a => {
        this.updateResults(a);
        this.onActionDone.emit(<ActionEvent>{
          checklistId: this.checklist.id,
          action: a
        });
      });
    }
  }

  /**
   * Gets the input type for a specific step field.
   * @param field The step field
   * @returns The input type.
   */
  getInputType(field: Field): string {
    switch (field.constraints.valueType as FieldValueType) {
      case FieldValueType.Text:
      case FieldValueType.MultilineText:
        return "text";
      case FieldValueType.Number:
        return "number";
      case FieldValueType.Datetime:
        return "datetime-local";
      default:
        throw Error("Unable to get input type");
    }
  }

  /**
   * Builds the form group.
   * @returns The form group.
   */
  private buildFormGroups(): FormGroup[] {
    return this.checklist.steps.map(step => {
      let newGroup = new FormGroup({});
   
      step.fields.map(field => {
          newGroup.addControl(field.id, this.buildFormControl(field));
      });

      return newGroup;
    });
  }

  /**
   * Builds the form control for the input step field.
   * @param field The step field
   * @returns The form control
   */
  private buildFormControl(field: Field): FormControl {

    let validators = [];
    let constraints = field.constraints;
    
    switch(field.type) {  
      case FieldType.Value: {
        switch(constraints.valueType) {
          case FieldValueType.Text: 
          case FieldValueType.MultilineText: {
            if (constraints.min) {
              validators.push(Validators.minLength(constraints.min));
            }
            if (constraints.max) {
              validators.push(Validators.maxLength(constraints.max));
            }
            break;
          }
          case FieldValueType.Number: {
            if (constraints.min) {
              validators.push(Validators.min(constraints.min));
            }
            if (constraints.max) {
              validators.push(Validators.max(constraints.max));
            }
            break;
          }
          case FieldValueType.Datetime: {
            break;
          }
        }

        if (!field.optional) {
          validators.push(Validators.required);
        }

        break;
      }
      case FieldType.Select: {
        validators.push(Validators.required);
        break;
      }
    }

    let previousValue = this.getPreviousValue(field);
    let formControl = new FormControl(previousValue, validators);
    formControl.updateValueAndValidity();
    return formControl;
  }

  /**
   * Retrieves the previous value of the defined field, if any.
   * @param field The field step
   * @returns The previous value; otherwise empty string.
   */
  private getPreviousValue(field: Field): string {
    let previousActions = this.actions.get(this.checklist.id);
    if (previousActions && previousActions.length > 0) {
      let action = previousActions.find(a => a.field == field.id);
      if (action && action.value !== '') {
        switch(field.constraints.valueType) {
          case FieldValueType.Text: 
          case FieldValueType.MultilineText:
          case FieldValueType.Number: {
            return action.value;
          }
          case FieldValueType.Datetime: {
            let date = moment(parseFloat(action.value))
            return date.format(moment.HTML5_FMT.DATETIME_LOCAL);
          }
        }
      }
    }
    return '';
  }  

  /**
   * Disables stepper linear mode if some step have already been filled.
   */
  private checkPreviousActions() {
    //enable step which value is correct
    let previousActions = this.actions.get(this.checklist.id);
    if (previousActions.length > 0) {
      this.linearMode = false;
    }
  }

  /**
   * Updates the checklist results.
   * @param action The newer action, if any.
   */
  private updateResults(action?: Action) {

    let resultValues = this.checklist.results.map(res => {

      let targetFields = this.checklist.steps.flatMap(i => i.fields.filter(f => f.references.includes(res.targetField)));
      let actions = this.actions.get(this.checklist.id).filter(a => targetFields.find(f => f.id == a.field));

      let values = [];
      if (action) {
        //handle new action
        values = actions.filter(a => !(a.field == action.field && a.step == action.step)).map(i => Number(i.value));

        let newValue = Number(action.value);
        if (!isNaN(newValue)) {
          values.push(newValue);
        }       
      } else {
        values = actions.map(i => Number(i.value));
      }
      values = values.filter(i => !isNaN(i));

      let value = 0;
      switch (res.strategy) {
        case StrategyType.Sum: {
          value = values.reduce((prev, next) => prev + next, 0);
          break;
        }
        default: 
          throw Error("Unable to format result value, strategy is not valid");
      }

      return `${res.name}: ${StringFormatter.Format(res.displayFormat, value)}`;
    });

    this.results.next(resultValues);
  }
}
