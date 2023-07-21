export class Queue<T> {
    values: T[];

    _maxLength: number;

    constructor(values: T[], maxLength: number = 0) {
        this.values = values;
        this._maxLength = maxLength;
    }

    push(item: T) {
        this.values.push(item);
        if (this._maxLength > 0 && this.values.length > this._maxLength) {
            this.values.shift();
        }
    }
}
