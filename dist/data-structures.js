'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var MAX_SIZE = 4096;

// internal to be inherited

var Data = (function () {
    function Data() {
        _classCallCheck(this, Data);

        this._arr = [];
    }

    _createClass(Data, [{
        key: Symbol.iterator,
        value: function () {
            return this._arr[Symbol.iterator](); // should be overridden for stacks, so we iterate from back to front
        }
    }, {
        key: 'flush',
        value: function flush() {
            this._arr.length = 0;
        }
    }, {
        key: 'empty',
        value: function empty() {
            return this._arr.length === 0;
        }
    }, {
        key: 'toString',
        value: function toString() {
            return this._arr.join(', ');
        }
    }, {
        key: Symbol.toStringTag,
        get: function () {
            return 'Data';
        }
    }, {
        key: 'length',
        get: function () {
            return this._arr.length;
        }
    }], [{
        key: 'construct',
        value: function construct() {
            return Object.create(this.constructor); // good? bad? even works?
            // return new Data(); // can we make `Data` dynamic so inherited classes can use this properly?
        }
    }]);

    return Data;
})();

Data[Symbol.toStringTag] = 'Data';

var Stack = (function (_Data) {
    function Stack() {
        _classCallCheck(this, Stack);

        _get(Object.getPrototypeOf(Stack.prototype), 'constructor', this).call(this);
    }

    _inherits(Stack, _Data);

    _createClass(Stack, [{
        key: 'push',
        value: function push(val) {
            this._arr.push(val);
        }
    }, {
        key: 'pop',
        value: function pop() {
            return this._arr.pop();
        }
    }, {
        key: 'peek',
        value: function peek() {
            return this._arr[this.length - 1]; // super or `this`?
        }
    }, {
        key: Symbol.toStringTag,
        get: function () {
            return 'Stack';
        }
    }]);

    return Stack;
})(Data);

exports.Stack = Stack;

Stack[Symbol.toStringTag] = 'Stack';

var FixedStack = (function (_Stack) {
    function FixedStack() {
        var size = arguments[0] === undefined ? MAX_SIZE : arguments[0];

        _classCallCheck(this, FixedStack);

        _get(Object.getPrototypeOf(FixedStack.prototype), 'constructor', this).call(this);
        this._size = size;
    }

    _inherits(FixedStack, _Stack);

    _createClass(FixedStack, [{
        key: 'push',
        value: function push(val) {
            if (!this.full()) return _get(Object.getPrototypeOf(FixedStack.prototype), 'push', this).call(this, val);
        }
    }, {
        key: 'full',
        value: function full() {
            return this.length >= this._size;
        }
    }, {
        key: Symbol.toStringTag,
        get: function () {
            return 'FixedStack';
        }
    }, {
        key: 'size',
        get: function () {
            return this._size;
        }
    }]);

    return FixedStack;
})(Stack);

exports.FixedStack = FixedStack;

FixedStack[Symbol.toStringTag] = 'FixedStack';

var Queue = (function (_Data2) {
    function Queue() {
        _classCallCheck(this, Queue);

        _get(Object.getPrototypeOf(Queue.prototype), 'constructor', this).call(this);
    }

    _inherits(Queue, _Data2);

    _createClass(Queue, [{
        key: 'push',
        value: function push(val) {
            this._arr.push(val);
        }
    }, {
        key: 'shift',
        value: function shift() {
            return this._arr.shift();
        }
    }, {
        key: 'peek',
        value: function peek() {
            return this._arr[0];
        }
    }, {
        key: Symbol.toStringTag,
        get: function () {
            return 'Queue';
        }
    }]);

    return Queue;
})(Data);

exports.Queue = Queue;

Queue[Symbol.toStringTag] = 'Queue'; // cheats! this is so Object.prototype.toString.call(Queue) returns '[object Queue]' (as expected?)

var FixedQueue = (function (_Queue) {
    function FixedQueue() {
        var size = arguments[0] === undefined ? MAX_SIZE : arguments[0];

        _classCallCheck(this, FixedQueue);

        _get(Object.getPrototypeOf(FixedQueue.prototype), 'constructor', this).call(this);
        this._size = size;
    }

    _inherits(FixedQueue, _Queue);

    _createClass(FixedQueue, [{
        key: 'push',
        value: function push(val) {
            if (!this.full()) // throw overflow? drop overflow?
                return _get(Object.getPrototypeOf(FixedQueue.prototype), 'push', this).call(this, val);
        }
    }, {
        key: 'full',
        value: function full() {
            return this.length >= this._size;
        }
    }, {
        key: Symbol.toStringTag,
        get: function () {
            return 'FixedQueue';
        }
    }, {
        key: 'size',
        get: function () {
            return this._size;
        }
    }]);

    return FixedQueue;
})(Queue);

exports.FixedQueue = FixedQueue;

FixedQueue[Symbol.toStringTag] = 'FixedQueue';