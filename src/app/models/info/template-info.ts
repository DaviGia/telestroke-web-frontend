import { UserInfo } from './user-info';

export class TemplateInfo {
    id: string;
    name: string;
    description: string;
    author: UserInfo;
    createdAt: Date;
    changedAt: Date;
}