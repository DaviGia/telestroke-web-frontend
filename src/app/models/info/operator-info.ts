import { UserInfo } from './user-info';
import { Operator } from '../operator';
import { BaseSessionInfo } from '../base/base-session-info';

export class OperatorInfo {
    id: string;
    user: UserInfo;
    description: string;
    currentSession?: BaseSessionInfo;

    constructor(operator: Operator, userInfo: UserInfo) {
        this.id = operator.id;
        this.user  = userInfo;
        this.description = operator.description;
    }
}