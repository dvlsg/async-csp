"use strict";

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

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

    // Data[Symbol.toStringTag] = 'Data';

    _createClass(Data, [{
        key: Symbol.iterator,
        value: function value() {
            return this[ARR][Symbol.iterator](); // should be overridden for stacks, so we iterate from back to front
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
            return [].concat(_toConsumableArray(this[ARR]));
        }
    }, {
        key: Symbol.toStringTag,
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
            return Object.create(this.constructor);
        }
    }]);

    return Data;
})();

var Stack = (function (_Data) {
    _inherits(Stack, _Data);

    function Stack() {
        _classCallCheck(this, Stack);

        _get(Object.getPrototypeOf(Stack.prototype), 'constructor', this).call(this);
    }

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
            return this[ARR][this.length - 1];
        }
    }, {
        key: Symbol.toStringTag,
        get: function get() {
            return 'Stack';
        }
    }]);

    return Stack;
})(Data);

exports.Stack = Stack;

var FixedStack = (function (_Stack) {
    _inherits(FixedStack, _Stack);

    function FixedStack() {
        var size = arguments.length <= 0 || arguments[0] === undefined ? MAX_SIZE : arguments[0];

        _classCallCheck(this, FixedStack);

        _get(Object.getPrototypeOf(FixedStack.prototype), 'constructor', this).call(this);
        this[SIZE] = size;
    }

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
        key: Symbol.toStringTag,
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
    _inherits(Queue, _Data2);

    function Queue() {
        _classCallCheck(this, Queue);

        _get(Object.getPrototypeOf(Queue.prototype), 'constructor', this).call(this);
    }

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
        key: Symbol.toStringTag,
        get: function get() {
            return 'Queue';
        }
    }]);

    return Queue;
})(Data);

exports.Queue = Queue;

var List = (function (_Queue) {
    _inherits(List, _Queue);

    function List() {
        _classCallCheck(this, List);

        _get(Object.getPrototypeOf(List.prototype), 'constructor', this).call(this);
    }

    _createClass(List, [{
        key: 'unshift',
        value: function unshift() {
            var _ARR;

            return (_ARR = this[ARR]).unshift.apply(_ARR, arguments);
        }
    }, {
        key: Symbol.toStringTag,
        get: function get() {
            return 'List';
        }
    }]);

    return List;
})(Queue);

exports.List = List;

var FixedQueue = (function (_Queue2) {
    _inherits(FixedQueue, _Queue2);

    function FixedQueue() {
        var size = arguments.length <= 0 || arguments[0] === undefined ? MAX_SIZE : arguments[0];

        _classCallCheck(this, FixedQueue);

        _get(Object.getPrototypeOf(FixedQueue.prototype), 'constructor', this).call(this);
        this[SIZE] = size;
    }

    _createClass(FixedQueue, [{
        key: 'push',
        value: function push(val) {
            if (!this.full()) // throw overflow? drop overflow? allow overflow?
                return _get(Object.getPrototypeOf(FixedQueue.prototype), 'push', this).call(this, val);
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
        key: Symbol.toStringTag,
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