"use strict";

const MAX_SIZE = 4096;

// can be swapped to symbols to make more 'private'
// makes it more difficult to debug, though.
let ARR = '_arr';
let SIZE = '_size';

// internal to be inherited
class Data {
    constructor() {
        this[ARR] = [];
    }

    static construct() {
        return Object.create(this.constructor); // good? bad? even works?
        // return new Data(); // can we make `Data` dynamic so inherited classes can use this properly?
    }

    get [Symbol.toStringTag]() {
        return 'Data';
    }

    [Symbol.iterator]() {
        return this[ARR][Symbol.iterator](); // should be overridden for stacks, so we iterate from back to front
    }

    flush() {
        this[ARR].length = 0;
    }

    empty() {
        return this[ARR].length === 0;
    }

    get length() {
        return this[ARR].length;
    }

    toString() {
        return this[ARR].join(', ');
    }
}
// Data[Symbol.toStringTag] = 'Data';

export class Stack extends Data {
    constructor() {
        super();
    }

    get [Symbol.toStringTag]() {
        return 'Stack';
    }

    push(val) {
        this[ARR].push(val);
    }

    pop() {
        return this[ARR].pop();
    }

    peek() {
        return this[ARR][this.length - 1]; // super or `this`?
    }
}
// Stack[Symbol.toStringTag] = 'Stack';

export class FixedStack extends Stack {
    constructor(size = MAX_SIZE) {
        super();
        this[SIZE] = size;
    }

    get [Symbol.toStringTag]() {
        return 'FixedStack';
    }

    get size() {
        return this[SIZE];
    }

    push(val) {
        if (!this.full())
            return super.push(val);
    }

    full() {
        return this.length >= this[SIZE];
    }
}
// FixedStack[Symbol.toStringTag] = 'FixedStack';

export class Queue extends Data {
    constructor() {
        super();
    }

    get [Symbol.toStringTag]() {
        return 'Queue';
    }

    push(val) {
        this[ARR].push(val);
    }

    shift() {
        return this[ARR].shift();
    }

    peek() {
        return this[ARR][0];
    }
}
// Queue[Symbol.toStringTag] = 'Queue'; // cheats! this is so Object.prototype.toString.call(Queue) returns '[object Queue]' (as expected?)

export class FixedQueue extends Queue {
    constructor(size = MAX_SIZE) {
        super();
        this[SIZE] = size;
    }

    get [Symbol.toStringTag]() {
        return 'FixedQueue';
    }

    get size() {
        return this[SIZE];
    }

    push(val) {
        if (!this.full()) // throw overflow? drop overflow?
            return super.push(val);
    }

    full() {
        return this.length >= this[SIZE];
    }
}
// FixedQueue[Symbol.toStringTag] = 'FixedQueue';
