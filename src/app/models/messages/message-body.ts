import { MessageType } from '../enums/message-type';

export class MessageBody {
    type: MessageType;
    data: string;

    constructor(type: MessageType, data: string = '{}') {
        this.type = type;
        this.data = data;
    }
}