'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _get = require('babel-runtime/helpers/get')['default'];

var _Symbol$iterator = require('babel-runtime/core-js/symbol/iterator')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _Symbol$toStringTag = require('babel-runtime/core-js/symbol/to-string-tag')['default'];

var _Object$create = require('babel-runtime/core-js/object/create')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});
var MAX_SIZE = 4096;

// can be swapped to symbols to make more 'private'
// makes it more difficult to debug, though.
var ARR = '_arr';
var SIZE = '_size';

// internal to be inherited

var Data = (function () {
    function Data() {
        _classCallCheck(this, Data);

        this[ARR] = [];
    }

    _createClass(Data, [{
        key: _Symbol$iterator,
        value: function value() {
            return _getIterator(this[ARR]); // should be overridden for stacks, so we iterate from back to front
        }
    }, {
        key: 'flush',
        value: function flush() {
            this[ARR].length = 0;
        }
    }, {
        key: 'empty',
        value: function empty() {
            return this[ARR].length === 0;
        }
    }, {
        key: 'toString',
        value: function toString() {
            return this[ARR].join(', ');
        }
    }, {
        key: _Symbol$toStringTag,
        get: function get() {
            return 'Data';
        }
    }, {
        key: 'length',
        get: function get() {
            return this[ARR].length;
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

// Data[Symbol.toStringTag] = 'Data';

var Stack = (function (_Data) {
    function Stack() {
        _classCallCheck(this, Stack);

        _get(Object.getPrototypeOf(Stack.prototype), 'constructor', this).call(this);
    }

    _inherits(Stack, _Data);

    _createClass(Stack, [{
        key: 'push',
        value: function push(val) {
            this[ARR].push(val);
        }
    }, {
        key: 'pop',
        value: function pop() {
            return this[ARR].pop();
        }
    }, {
        key: 'peek',
        value: function peek() {
            return this[ARR][this.length - 1]; // super or `this`?
        }
    }, {
        key: _Symbol$toStringTag,
        get: function get() {
            return 'Stack';
        }
    }]);

    return Stack;
})(Data);

exports.Stack = Stack;

// Stack[Symbol.toStringTag] = 'Stack';

var FixedStack = (function (_Stack) {
    function FixedStack() {
        var size = arguments[0] === undefined ? MAX_SIZE : arguments[0];

        _classCallCheck(this, FixedStack);

        _get(Object.getPrototypeOf(FixedStack.prototype), 'constructor', this).call(this);
        this[SIZE] = size;
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
            return this.length >= this[SIZE];
        }
    }, {
        key: _Symbol$toStringTag,
        get: function get() {
            return 'FixedStack';
        }
    }, {
        key: 'size',
        get: function get() {
            return this[SIZE];
        }
    }]);

    return FixedStack;
})(Stack);

exports.FixedStack = FixedStack;

var Queue = (function (_Data2) {
    function Queue() {
        _classCallCheck(this, Queue);

        _get(Object.getPrototypeOf(Queue.prototype), 'constructor', this).call(this);
    }

    _inherits(Queue, _Data2);

    _createClass(Queue, [{
        key: 'push',
        value: function push(val) {
            this[ARR].push(val);
        }
    }, {
        key: 'shift',
        value: function shift() {
            return this[ARR].shift();
        }
    }, {
        key: 'peek',
        value: function peek() {
            return this[ARR][0];
        }
    }, {
        key: _Symbol$toStringTag,
        get: function get() {
            return 'Queue';
        }
    }]);

    return Queue;
})(Data);

exports.Queue = Queue;

var List = (function (_Queue) {
    function List() {
        _classCallCheck(this, List);

        _get(Object.getPrototypeOf(List.prototype), 'constructor', this).call(this);
    }

    _inherits(List, _Queue);

    _createClass(List, [{
        key: 'unshift',
        value: function unshift() {
            var _ARR;

            return (_ARR = this[ARR]).unshift.apply(_ARR, arguments);
        }
    }, {
        key: _Symbol$toStringTag,
        get: function get() {
            return 'List';
        }
    }]);

    return List;
})(Queue);

exports.List = List;

var FixedQueue = (function (_Queue2) {
    function FixedQueue() {
        var size = arguments[0] === undefined ? MAX_SIZE : arguments[0];

        _classCallCheck(this, FixedQueue);

        _get(Object.getPrototypeOf(FixedQueue.prototype), 'constructor', this).call(this);
        this[SIZE] = size;
    }

    _inherits(FixedQueue, _Queue2);

    _createClass(FixedQueue, [{
        key: 'push',
        value: function push(val) {
            if (!this.full()) // throw overflow? drop overflow?
                return _get(Object.getPrototypeOf(FixedQueue.prototype), 'push', this).call(this, val);
        }
    }, {
        key: 'full',
        value: function full() {
            return this.length >= this[SIZE];
        }
    }, {
        key: _Symbol$toStringTag,
        get: function get() {
            return 'FixedQueue';
        }
    }, {
        key: 'size',
        get: function get() {
            return this[SIZE];
        }
    }]);

    return FixedQueue;
})(Queue);

exports.FixedQueue = FixedQueue;

// FixedQueue[Symbol.toStringTag] = 'FixedQueue';