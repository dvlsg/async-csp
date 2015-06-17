"use strict";

const MAX_SIZE = 4096;

// internal to be inherited
class Data {
    constructor() {
        this._arr = [];
    }

    static construct() {
        return Object.create(this.constructor); // good? bad? even works?
        // return new Data(); // can we make `Data` dynamic so inherited classes can use this properly?
    }

    get [Symbol.toStringTag]() {
        return 'Data';
    }

    [Symbol.iterator]() {
        return this._arr[Symbol.iterator](); // should be overridden for stacks, so we iterate from back to front
    }

    flush() {
        this._arr.length = 0;
    }

    empty() {
        return this._arr.length === 0;
    }

    get length() {
        return this._arr.length;
    }

    toString() {
        return this._arr.join(', ');
    }
}
Data[Symbol.toStringTag] = 'Data';

export class Stack extends Data {
    constructor() {
        super();
    }

    get [Symbol.toStringTag]() {
        return 'Stack';
    }

    push(val) {
        this._arr.push(val);
    }

    pop() {
        return this._arr.pop();
    }

    peek() {
        return this._arr[this.length - 1]; // super or `this`?
    }
}
Stack[Symbol.toStringTag] = 'Stack';

export class FixedStack extends Stack {
    constructor(size = MAX_SIZE) {
        super();
        this._size = size;
    }

    get [Symbol.toStringTag]() {
        return 'FixedStack';
    }

    get size() {
        return this._size;
    }

    push(val) {
        if (!this.full())
            return super.push(val);
    }

    full() {
        return this.length >= this._size;
    }
}
FixedStack[Symbol.toStringTag] = 'FixedStack';

export class Queue extends Data {
    constructor() {
        super();
    }

    get [Symbol.toStringTag]() {
        return 'Queue';
    }

    push(val) {
        this._arr.push(val);
    }

    shift() {
        return this._arr.shift();
    }

    peek() {
        return this._arr[0];
    }
}
Queue[Symbol.toStringTag] = 'Queue'; // cheats! this is so Object.prototype.toString.call(Queue) returns '[object Queue]' (as expected?)

export class FixedQueue extends Queue {
    constructor(size = MAX_SIZE) {
        super();
        this._size = size;
    }

    get [Symbol.toStringTag]() {
        return 'FixedQueue';
    }

    get size() {
        return this._size;
    }

    push(val) {
        if (!this.full()) // throw overflow? drop overflow?
            return super.push(val);
    }

    full() {
        return this.length >= this._size;
    }
}
FixedQueue[Symbol.toStringTag] = 'FixedQueue';
