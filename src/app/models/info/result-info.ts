import { StrategyType } from '../enums/strategy-type';
import { FieldInfo } from './field-info';

export class ResultInfo {
    id: string;
    name: string;
    description: string;
    strategy: StrategyType;
    displayFormat: string;
    referencedFields: FieldInfo[];
    value: string;
}