import { StrategyType } from './enums/strategy-type';

export class Result {
    id: string;
    name: string;
    description: string;
    strategy: StrategyType;
    targetField: string;
    displayFormat: string;
}