"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SlidingBuffer = exports.DroppingBuffer = exports.FixedQueue = exports.List = exports.Queue = exports.FixedStack = exports.Stack = undefined;

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _toStringTag = require('babel-runtime/core-js/symbol/to-string-tag');

var _toStringTag2 = _interopRequireDefault(_toStringTag);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _iterator = require('babel-runtime/core-js/symbol/iterator');

var _iterator2 = _interopRequireDefault(_iterator);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MAX_SIZE = 4096;

// can be swapped to symbols to make more 'private'
// makes it more difficult to debug, though.
var ARR = '_arr';
var SIZE = '_size';

// internal to be inherited

var Data = function () {
    function Data() {
        (0, _classCallCheck3.default)(this, Data);

        this[ARR] = [];
    }

    (0, _createClass3.default)(Data, [{
        key: _iterator2.default,
        value: function value() {
            return (0, _getIterator3.default)(this[ARR]); // should be overridden for stacks, so we iterate from back to front
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
        key: 'values',
        value: function values() {
            return [].concat((0, _toConsumableArray3.default)(this[ARR]));
        }
    }, {
        key: _toStringTag2.default,
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
            return (0, _create2.default)(this.constructor);
        }
    }]);
    return Data;
}();
// Data[Symbol.toStringTag] = 'Data';

var Stack = exports.Stack = function (_Data) {
    (0, _inherits3.default)(Stack, _Data);

    function Stack() {
        (0, _classCallCheck3.default)(this, Stack);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Stack).call(this));
    }

    (0, _createClass3.default)(Stack, [{
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
            return this[ARR][this.length - 1];
        }
    }, {
        key: _toStringTag2.default,
        get: function get() {
            return 'Stack';
        }
    }]);
    return Stack;
}(Data);

var FixedStack = exports.FixedStack = function (_Stack) {
    (0, _inherits3.default)(FixedStack, _Stack);

    function FixedStack() {
        var size = arguments.length <= 0 || arguments[0] === undefined ? MAX_SIZE : arguments[0];
        (0, _classCallCheck3.default)(this, FixedStack);

        var _this2 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(FixedStack).call(this));

        _this2[SIZE] = size;
        return _this2;
    }

    (0, _createClass3.default)(FixedStack, [{
        key: 'push',
        value: function push(val) {
            if (!this.full()) return (0, _get3.default)((0, _getPrototypeOf2.default)(FixedStack.prototype), 'push', this).call(this, val);
        }
    }, {
        key: 'full',
        value: function full() {
            return this.length >= this[SIZE];
        }
    }, {
        key: _toStringTag2.default,
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
}(Stack);

var Queue = exports.Queue = function (_Data2) {
    (0, _inherits3.default)(Queue, _Data2);

    function Queue() {
        (0, _classCallCheck3.default)(this, Queue);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Queue).call(this));
    }

    (0, _createClass3.default)(Queue, [{
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
        key: _toStringTag2.default,
        get: function get() {
            return 'Queue';
        }
    }]);
    return Queue;
}(Data);

var List = exports.List = function (_Queue) {
    (0, _inherits3.default)(List, _Queue);

    function List() {
        (0, _classCallCheck3.default)(this, List);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(List).call(this));
    }

    (0, _createClass3.default)(List, [{
        key: 'unshift',
        value: function unshift() {
            var _ARR;

            return (_ARR = this[ARR]).unshift.apply(_ARR, arguments);
        }
    }, {
        key: _toStringTag2.default,
        get: function get() {
            return 'List';
        }
    }]);
    return List;
}(Queue);

var FixedQueue = exports.FixedQueue = function (_Queue2) {
    (0, _inherits3.default)(FixedQueue, _Queue2);

    function FixedQueue() {
        var size = arguments.length <= 0 || arguments[0] === undefined ? MAX_SIZE : arguments[0];
        (0, _classCallCheck3.default)(this, FixedQueue);

        var _this5 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(FixedQueue).call(this));

        _this5[SIZE] = size;
        return _this5;
    }

    (0, _createClass3.default)(FixedQueue, [{
        key: 'push',
        value: function push(val) {
            if (!this.full()) // throw overflow? drop overflow? allow overflow?
                return (0, _get3.default)((0, _getPrototypeOf2.default)(FixedQueue.prototype), 'push', this).call(this, val);
        }
    }, {
        key: 'full',
        value: function full() {
            return this.length >= this[SIZE];
        }
    }, {
        key: 'unshift',
        value: function unshift() {
            var _ARR2;

            // this isn't really a queue anymore. maybe FixedList instead?
            return (_ARR2 = this[ARR]).unshift.apply(_ARR2, arguments);
        }
    }, {
        key: _toStringTag2.default,
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
}(Queue);

var DroppingBuffer = exports.DroppingBuffer = function (_Queue3) {
    (0, _inherits3.default)(DroppingBuffer, _Queue3);

    function DroppingBuffer() {
        var size = arguments.length <= 0 || arguments[0] === undefined ? MAX_SIZE : arguments[0];
        (0, _classCallCheck3.default)(this, DroppingBuffer);

        var _this6 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(DroppingBuffer).call(this));

        _this6[SIZE] = size;
        return _this6;
    }

    (0, _createClass3.default)(DroppingBuffer, [{
        key: 'unshift',
        value: function unshift() {
            // we only need to grab the first item
            if (this[ARR].length === 0 && (arguments.length <= 0 ? undefined : arguments[0])) this[ARR][0] = arguments.length <= 0 ? undefined : arguments[0];
        }
    }, {
        key: 'push',
        value: function push(val) {
            if (this[ARR].length === 0) this[ARR][0] = val;
        }
    }, {
        key: 'full',
        value: function full() {
            return false;
        }
    }, {
        key: _toStringTag2.default,
        get: function get() {
            return 'DroppingBuffer';
        }
    }]);
    return DroppingBuffer;
}(Queue);

var SlidingBuffer = exports.SlidingBuffer = function (_Queue4) {
    (0, _inherits3.default)(SlidingBuffer, _Queue4);

    function SlidingBuffer() {
        var size = arguments.length <= 0 || arguments[0] === undefined ? MAX_SIZE : arguments[0];
        (0, _classCallCheck3.default)(this, SlidingBuffer);

        var _this7 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(SlidingBuffer).call(this));

        _this7[SIZE] = size; // need to make sure size is a positive integer.
        _this7.head = 0; // pointer to oldest value
        _this7.tail = 0; // pointer to newest value
        _this7.count = 0;
        return _this7;
    }

    (0, _createClass3.default)(SlidingBuffer, [{
        key: 'empty',
        value: function empty() {
            return this.count === 0;
        }
    }, {
        key: 'full',
        value: function full() {
            return false;
        }
    }, {
        key: 'push',
        value: function push(val) {
            if (this.count === 0) {
                this[ARR][this.tail] = val;
                this.head = this.tail;
                this.count = 1;
                return;
            }
            var _size = this[SIZE];
            this.tail = (this.tail + 1) % _size;
            this[ARR][this.tail] = val;
            var overwrite = this.tail === this.head;
            if (overwrite) this.head = (this.head + 1) % _size;
            if (!overwrite) this.count += 1;
        }
    }, {
        key: 'shift',
        value: function shift() {
            var val = this[ARR][this.head];
            delete this[ARR][this.head];
            this.head = (this.head + 1) % this[SIZE];
            this.count -= 1;
            return val;
        }
    }, {
        key: _toStringTag2.default,
        get: function get() {
            return 'SlidingBuffer';
        }
    }]);
    return SlidingBuffer;
}(Queue);