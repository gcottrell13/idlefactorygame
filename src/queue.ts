export class Queue<T> {
    values: T[];

    _maxLength: number;

    constructor(values: T[], maxLength: number = 0) {
        this.values = values;
        this._maxLength = maxLength;
    }

    /**
     * adds an item to the queue. if the max queue size was reached, it pops an item and returns it.
     * @param item
     * @returns
     */
    push = (item: T): T | undefined => {
        this.values.push(item);
        if (this._maxLength > 0 && this.values.length > this._maxLength) {
            return this.pop();
        }
        return undefined;
    };

    pop = (): T | undefined => {
        if (this.values.length > 0) {
            return this.values.shift();
        }
        return undefined;
    };
}
