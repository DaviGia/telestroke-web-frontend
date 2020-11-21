import { Step } from './step';
import { Result } from './result';

export class Checklist {
    id: string;
    name: string;
    description: string;
    author: string;
    createdAt: Date;
    changedAt: Date;
    steps: Step[];
    results: Result[];
}