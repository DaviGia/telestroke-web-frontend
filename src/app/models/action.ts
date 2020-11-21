export class Action {
    step: string;
    time: Date;
    field: string;
    value: string;

    constructor(step: string, field: string, value: string) {
        this.step = step;
        this.field = field;
        this.value = value;
        this.time = new Date();
    }
}