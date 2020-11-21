import { UserInfo } from '../info/user-info';
import { BaseTemplateInfo } from './base-template-info';

export class BaseSessionInfo {
    id: string;
    specialist: UserInfo;
    startDate: Date;
    template: BaseTemplateInfo;
}