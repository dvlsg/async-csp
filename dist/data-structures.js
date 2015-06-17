'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _get = require('babel-runtime/helpers/get')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _Symbol$iterator = require('babel-runtime/core-js/symbol/iterator')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _Symbol$toStringTag = require('babel-runtime/core-js/symbol/to-string-tag')['default'];

var _Object$create = require('babel-runtime/core-js/object/create')['default'];

_Object$defineProperty(exports, '__esModule', {
    value: true
});

var MAX_SIZE = 4096;

// internal to be inherited

var Data = (function () {
    function Data() {
        _classCallCheck(this, Data);

        this._arr = [];
    }

    _createClass(Data, [{
        key: _Symbol$iterator,
        value: function () {
            return _getIterator(this._arr); // should be overridden for stacks, so we iterate from back to front
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
        key: _Symbol$toStringTag,
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
            return _Object$create(this.constructor); // good? bad? even works?
            // return new Data(); // can we make `Data` dynamic so inherited classes can use this properly?
        }
    }]);

    return Data;
})();

Data[_Symbol$toStringTag] = 'Data';

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
        key: _Symbol$toStringTag,
        get: function () {
            return 'Stack';
        }
    }]);

    return Stack;
})(Data);

exports.Stack = Stack;

Stack[_Symbol$toStringTag] = 'Stack';

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
        key: _Symbol$toStringTag,
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

FixedStack[_Symbol$toStringTag] = 'FixedStack';

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
        key: _Symbol$toStringTag,
        get: function () {
            return 'Queue';
        }
    }]);

    return Queue;
})(Data);

exports.Queue = Queue;

Queue[_Symbol$toStringTag] = 'Queue'; // cheats! this is so Object.prototype.toString.call(Queue) returns '[object Queue]' (as expected?)

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
        key: _Symbol$toStringTag,
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

FixedQueue[_Symbol$toStringTag] = 'FixedQueue';