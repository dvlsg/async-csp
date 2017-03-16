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

class Stack extends Data {
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

class FixedStack extends Stack {
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

class Queue extends Data {
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

class List extends Queue {
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

class FixedQueue extends Queue {
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

class DroppingBuffer extends Queue {
    constructor(size = MAX_SIZE) {
        super();
        this[SIZE] = size;
    }

    get [Symbol.toStringTag]() {
        return 'DroppingBuffer';
    }

    unshift(...vals) {
        // we only need to grab the first item
        if (this[ARR].length === 0 && vals[0])
            this[ARR][0] = vals[0];
    }

    push(val) {
        if (this[ARR].length === 0)
            this[ARR][0] = val;
    }

    full() {
        return false;
    }
}

class SlidingBuffer extends Queue {
    constructor(size = MAX_SIZE) {
        super();
        this[SIZE] = size; // need to make sure size is a positive integer.
        this.head = 0; // pointer to oldest value
        this.tail = 0; // pointer to newest value
        this.count = 0;
    }

    get[Symbol.toStringTag]() {
        return 'SlidingBuffer';
    }

    empty() {
        return this.count === 0;
    }

    full() {
        return false;
    }

    push(val) {
        if (this.count === 0) {
            this[ARR][this.tail] = val;
            this.head = this.tail;
            this.count = 1;
            return;
        }
        let _size = this[SIZE];
        this.tail = (this.tail + 1) % _size;
        this[ARR][this.tail] = val;
        let overwrite = this.tail === this.head;
        if (overwrite)
            this.head = (this.head + 1) % _size;
        if (!overwrite)
            this.count += 1;
    }

    shift() {
        let val = this[ARR][this.head];
        delete this[ARR][this.head];
        this.head = (this.head + 1) % this[SIZE];
        this.count -= 1;
        return val;
    }
}

module.exports = {
    Stack,
    FixedStack,
    Queue,
    List,
    FixedQueue,
    DroppingBuffer,
    SlidingBuffer
};
