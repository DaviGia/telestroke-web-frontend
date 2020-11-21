import { TemplatePhase } from './template-phase';

export class Template {
    id: string;
    name: string;
    description: string;
    author: string;
    createdAt: Date;
    changedAt: Date;
    phases: TemplatePhase[];
}