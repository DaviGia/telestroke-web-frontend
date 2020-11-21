import { Session } from '../session';
import { TemplateInfo } from './template-info';
import { UserInfo } from './user-info';

export class SessionInfo {
    id: string;
    specialist: UserInfo;
    operator: UserInfo;
    startDate: Date;
    endDate?: Date;
    template: TemplateInfo;

    constructor(session: Session) {
        this.id = session.id;
        this.startDate = session.startDate;
        this.endDate = session.endDate;
    }
}