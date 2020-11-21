import { Field } from './field';

export class Step {
    id: string;
    name: string;
    description: string;
    order: number;
    fields: Field[];
}