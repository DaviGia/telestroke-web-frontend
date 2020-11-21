import { FieldType } from './enums/field-type';
import { FieldConstrains } from './field-constraints';
import { FieldValue } from './field-value';

export class Field {
    id: string;
    name: string;
    description: string;
    order: number;
    type: FieldType;
    optional: boolean;
    constraints: FieldConstrains;
    values: FieldValue[];
    references: string[];
}