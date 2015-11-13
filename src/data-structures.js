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
        return Object.create(this.constructor);
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

    values() {
        return [ ...this[ARR] ];
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
        return this[ARR][this.length - 1];
    }
}

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

export class List extends Queue {
    constructor() {
        super();
    }

    get [Symbol.toStringTag]() {
        return 'List';
    }

    unshift(...vals) {
        return this[ARR].unshift(...vals);
    }
}

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
        if (!this.full()) // throw overflow? drop overflow? allow overflow?
            return super.push(val);
    }

    full() {
        return this.length >= this[SIZE];
    }

    unshift(...vals) { // this isn't really a queue anymore. maybe FixedList instead?
        return this[ARR].unshift(...vals);
    }
}
