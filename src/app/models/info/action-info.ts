import { FieldValueType } from 'src/app/models/enums/field-value-type';
import { StepInfo } from './step-info';
import { FieldInfo } from './field-info';
import { FieldType } from '../enums/field-type';

export interface ActionInfo {
  step: StepInfo;
  field: FieldInfo;
  value: string;
  type: FieldType;
  valueType: FieldValueType;
}
