"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Channel = exports.ACTIONS = exports.STATES = undefined;

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _entries = require('babel-runtime/core-js/array/entries');

var _entries2 = _interopRequireDefault(_entries);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

var _context;

/*
    Flushes out any remaining takes from the channel
    by sending them the value of `ACTIONS.DONE`.
*/

var flush = function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(ch) {
        var take, takes;
        return _regenerator2.default.wrap(function _callee$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        if (ch.empty()) {
                            _context2.next = 2;
                            break;
                        }

                        throw new Error('Attempted to execute flush(Channel) on a non-empty channel!');

                    case 2:
                        if (!ch[IS_FLUSHING]) {
                            _context2.next = 4;
                            break;
                        }

                        return _context2.abrupt('return');

                    case 4:
                        ch[IS_FLUSHING] = true;
                        take = null, takes = [];

                        while (take = ch.takes.shift()) {
                            // eslint-disable-line no-cond-assign
                            takes.push(take(ACTIONS.DONE));
                        }_context2.next = 9;
                        return _promise2.default.all(takes);

                    case 9:
                        if (!ch[IS_CONSUMING]) finish(ch);
                        ch[IS_FLUSHING] = false;

                    case 11:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee, this);
    }));
    return function flush(_x) {
        return ref.apply(this, arguments);
    };
}();

var _bufferedSlide = function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(ch) {
        var _this2 = this;

        var _loop, put;

        return _regenerator2.default.wrap(function _callee5$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        _loop = _regenerator2.default.mark(function _loop() {
                            var buf, val, take;
                            return _regenerator2.default.wrap(function _loop$(_context6) {
                                while (1) {
                                    switch (_context6.prev = _context6.next) {
                                        case 0:
                                            buf = ch.buf.shift();
                                            val = null;

                                            if (!(buf && buf.wrapped)) {
                                                _context6.next = 8;
                                                break;
                                            }

                                            _context6.next = 5;
                                            return buf.wrapped();

                                        case 5:
                                            val = _context6.sent;
                                            _context6.next = 9;
                                            break;

                                        case 8:
                                            val = buf;

                                        case 9:
                                            // this is a special case caused by `from`. can we get rid of the need for this?
                                            if (typeof val !== 'undefined') {
                                                if (val instanceof _dataStructures.List) {
                                                    (function () {
                                                        // need a way to distinguish this as a "special" array return
                                                        var accepted = [].concat((0, _toConsumableArray3.default)(val));
                                                        if (accepted.length === 0) buf.resolve();else if (accepted.length === 1) {
                                                            buf.resolve();
                                                            var take = ch.takes.shift();
                                                            take(accepted[0]);
                                                        } else /* accepted.length > 1 */{
                                                                (function () {
                                                                    var _ch$buf;

                                                                    var count = 0;
                                                                    var counter = function counter() {
                                                                        count++;
                                                                        if (count === accepted.length) buf.resolve();
                                                                    };
                                                                    var wrappers = accepted.map(function (acc) {
                                                                        return wrap(acc, function (x) {
                                                                            return x;
                                                                        }, counter);
                                                                    });
                                                                    // when we use counter as the resolve, it makes us need
                                                                    // to call buf.resolve(), whereas we wouldn't normally,
                                                                    // since resolve() should have been called when moving
                                                                    // from put -> buf.

                                                                    // the problem is that when we use these expanded wrappers,
                                                                    // we need to execute the resolution. if we place on the buffer
                                                                    // directly, we can be sure we maintain the correct order.
                                                                    // if we place back on puts instead of the buffer,
                                                                    // we may or may not have the right order anymore.

                                                                    // another issue is what if we accept more than the buffer has space for?
                                                                    // what if there were already items on the buffer? do we kick them out,
                                                                    // and put them back in puts? that gives us essentially the same problem --
                                                                    // then we would have puts which don't need put.resolve() to be called,
                                                                    // which doesn't follow the usual pattern.

                                                                    // what to do, what to do... try to hammer out the inconsistency at some point.

                                                                    (_ch$buf = ch.buf).unshift.apply(_ch$buf, (0, _toConsumableArray3.default)(wrappers)); // this can expand beyond the actual buffer size. unintuitive?
                                                                })();
                                                            }
                                                    })();
                                                } else {
                                                        take = ch.takes.shift();

                                                        take(val);
                                                    }
                                            }

                                        case 10:
                                        case 'end':
                                            return _context6.stop();
                                    }
                                }
                            }, _loop, _this2);
                        });

                    case 1:
                        if (!(!ch.buf.empty() && !ch.takes.empty())) {
                            _context7.next = 5;
                            break;
                        }

                        return _context7.delegateYield(_loop(), 't0', 3);

                    case 3:
                        _context7.next = 1;
                        break;

                    case 5:
                        while (!ch.puts.empty() && !ch.buf.full()) {
                            put = ch.puts.shift();

                            ch.buf.push(put);
                            put.resolve();
                        }

                    case 6:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, _callee5, this);
    }));
    return function _bufferedSlide(_x2) {
        return ref.apply(this, arguments);
    };
}();

var _slide = function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(ch) {
        var _this3 = this;

        var _loop2;

        return _regenerator2.default.wrap(function _callee6$(_context9) {
            while (1) {
                switch (_context9.prev = _context9.next) {
                    case 0:
                        _loop2 = _regenerator2.default.mark(function _loop2() {
                            var put, val, take;
                            return _regenerator2.default.wrap(function _loop2$(_context8) {
                                while (1) {
                                    switch (_context8.prev = _context8.next) {
                                        case 0:
                                            put = ch.puts.shift();
                                            _context8.next = 3;
                                            return put.wrapped();

                                        case 3:
                                            val = _context8.sent;

                                            if (typeof val !== 'undefined') {
                                                if (val instanceof _dataStructures.List) {
                                                    (function () {
                                                        // need a way to distinguish this as a "special" array return
                                                        var accepted = [].concat((0, _toConsumableArray3.default)(val));
                                                        if (accepted.length === 0) put.resolve();else if (accepted.length === 1) {
                                                            put.resolve();
                                                            var take = ch.takes.shift();
                                                            take(accepted[0]);
                                                        } else /* val.length > 1 */{
                                                                (function () {
                                                                    var _ch$puts;

                                                                    var count = 0;
                                                                    var counter = function counter() {
                                                                        count++;
                                                                        if (count === accepted.length) put.resolve();
                                                                    };
                                                                    var wrappers = accepted.map(function (acc) {
                                                                        return wrap(acc, function (x) {
                                                                            return x;
                                                                        }, counter);
                                                                    });
                                                                    (_ch$puts = ch.puts).unshift.apply(_ch$puts, (0, _toConsumableArray3.default)(wrappers));
                                                                })();
                                                            }
                                                    })();
                                                } else {
                                                    put.resolve();
                                                    take = ch.takes.shift();

                                                    take(val);
                                                }
                                            } else {
                                                put.resolve();
                                            }

                                        case 5:
                                        case 'end':
                                            return _context8.stop();
                                    }
                                }
                            }, _loop2, _this3);
                        });

                    case 1:
                        if (!(!ch.takes.empty() && !ch.puts.empty())) {
                            _context9.next = 5;
                            break;
                        }

                        return _context9.delegateYield(_loop2(), 't0', 3);

                    case 3:
                        _context9.next = 1;
                        break;

                    case 5:
                    case 'end':
                        return _context9.stop();
                }
            }
        }, _callee6, this);
    }));
    return function _slide(_x3) {
        return ref.apply(this, arguments);
    };
}();

var slide = function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(ch) {
        var _ch$puts2;

        return _regenerator2.default.wrap(function _callee7$(_context10) {
            while (1) {
                switch (_context10.prev = _context10.next) {
                    case 0:
                        if (!ch[IS_SLIDING]) {
                            _context10.next = 2;
                            break;
                        }

                        return _context10.abrupt('return');

                    case 2:
                        ch[IS_SLIDING] = true;

                    case 3:
                        if (!canSlide(ch)) {
                            _context10.next = 8;
                            break;
                        }

                        _context10.next = 6;
                        return ch[SLIDER](ch);

                    case 6:
                        _context10.next = 3;
                        break;

                    case 8:
                        if (!(ch[STATE] === STATES.CLOSED && !ch.tails.empty() && (ch.buf ? ch.buf.empty() : true) && ch.puts.empty())) {
                            _context10.next = 16;
                            break;
                        }

                        (_ch$puts2 = ch.puts).unshift.apply(_ch$puts2, (0, _toConsumableArray3.default)(ch.tails));
                        ch.tails = new _dataStructures.List(); // need a way to empty out the list

                    case 11:
                        if (!canSlide(ch)) {
                            _context10.next = 16;
                            break;
                        }

                        _context10.next = 14;
                        return ch[SLIDER](ch);

                    case 14:
                        _context10.next = 11;
                        break;

                    case 16:

                        if ((ch[STATE] === STATES.CLOSED || ch[STATE] === STATES.ENDED) && (ch.buf ? ch.buf.empty() : true) && ch.puts.empty() && ch.tails.empty()) flush(ch);

                        ch[IS_SLIDING] = false;

                    case 18:
                    case 'end':
                        return _context10.stop();
                }
            }
        }, _callee7, this);
    }));
    return function slide(_x4) {
        return ref.apply(this, arguments);
    };
}();

exports.timeout = timeout;

var _dataStructures = require('./data-structures.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (_context = console).log.bind(_context); // eslint-disable-line no-unused-vars

/*
    Three possible states:

    OPEN   : The Channel can be written to and taken from freely.
    CLOSED : The Channel can no longer be written to, but still has values to be taken.
    ENDED  : The Channel is closed, and no longer has values to be taken.
*/
var STATES = exports.STATES = {
    OPEN: (0, _symbol2.default)('channel_open'),
    CLOSED: (0, _symbol2.default)('channel_closed'),
    ENDED: (0, _symbol2.default)('channel_ended')
};

var ACTIONS = exports.ACTIONS = {
    // channel has just been closed, and has no more values to take
    DONE: (0, _symbol2.default)('channel_done'),
    CANCEL: (0, _symbol2.default)('channel_cancel')
};

var SLIDER = (0, _symbol2.default)('channel_slider');
var STATE = (0, _symbol2.default)('channel_state');
var SHOULD_CLOSE = (0, _symbol2.default)('channel_should_close');
var IS_CONSUMING = (0, _symbol2.default)('channel_consuming');
var IS_FLUSHING = (0, _symbol2.default)('channel_flushing');
var IS_SLIDING = (0, _symbol2.default)('channel_sliding');

/*
    Error expose method to assist with ensuring
    that error messages are properly thrown instead of swallowed.

    setTimeout is used to ensure that the error is thrown
    from a location that will not be eaten by an async throw.
*/
function expose(e) {
    setTimeout(function () {
        throw e;
    });
}

/*
    Marks a channel as ended, and signals any promises
    which are waiting for the end of the channel.
*/
function finish(ch) {
    ch[STATE] = STATES.ENDED;
    var waiting = null;
    while (waiting = ch.waiting.shift()) {
        // eslint-disable-line no-cond-assign
        waiting();
    }
}

function wrap(val, transform, resolve) {
    var _this = this;

    var wrapped = null;
    if (transform instanceof Function) {
        if (transform.length === 1) {
            wrapped = function () {
                var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
                    var transformed, actual;
                    return _regenerator2.default.wrap(function _callee2$(_context3) {
                        while (1) {
                            switch (_context3.prev = _context3.next) {
                                case 0:
                                    transformed = transform(val);

                                    if (!(transformed instanceof _promise2.default)) {
                                        _context3.next = 6;
                                        break;
                                    }

                                    _context3.next = 4;
                                    return transformed;

                                case 4:
                                    actual = _context3.sent;
                                    return _context3.abrupt('return', actual);

                                case 6:
                                    return _context3.abrupt('return', transformed);

                                case 7:
                                case 'end':
                                    return _context3.stop();
                            }
                        }
                    }, _callee2, _this);
                }));
                return function wrapped() {
                    return ref.apply(this, arguments);
                };
            }();
        } else {
            (function () {
                var accepted = new _dataStructures.List();
                if (transform.length === 2) {
                    wrapped = function () {
                        var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
                            return _regenerator2.default.wrap(function _callee3$(_context4) {
                                while (1) {
                                    switch (_context4.prev = _context4.next) {
                                        case 0:
                                            _context4.next = 2;
                                            return transform(val, function (acc) {
                                                if (typeof acc !== 'undefined') accepted.push(acc);
                                            });

                                        case 2:
                                            return _context4.abrupt('return', accepted);

                                        case 3:
                                        case 'end':
                                            return _context4.stop();
                                    }
                                }
                            }, _callee3, _this);
                        }));
                        return function wrapped() {
                            return ref.apply(this, arguments);
                        };
                    }();
                } else /* transform.length === 3 */{
                        wrapped = function wrapped() {
                            return new _promise2.default(function (res) {
                                transform(val, function (acc) {
                                    if (typeof acc !== 'undefined') accepted.push(acc);
                                }, function () {
                                    res(accepted);
                                });
                            });
                        };
                    }
            })();
        }
    } else {
        wrapped = function () {
            var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
                return _regenerator2.default.wrap(function _callee4$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                return _context5.abrupt('return', val);

                            case 1:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee4, _this);
            }));
            return function wrapped() {
                return ref.apply(this, arguments);
            };
        }();
    }
    return {
        wrapped: wrapped,
        resolve: resolve,
        transform: transform,
        val: val
    };
}

function canSlide(ch) {
    return ch.buf ? !ch.buf.full() && !ch.puts.empty() || !ch.takes.empty() && !ch.buf.empty() : !ch.takes.empty() && !ch.puts.empty();
}

function timeout() {
    var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

    return new _promise2.default(function (resolve) {
        setTimeout(resolve, delay);
    });
}

var Channel = exports.Channel = function () {

    /*
        Default constructor for a Channel.
         Accepts an optional size for the internal buffer,
        and an optional transform function to be used by the Channel.
         Examples:
            new Channel()              -> Non buffered channel, no transform
            new Channel(x => x * 2)    -> Non buffered channel, with transform
            new Channel(8)             -> Buffered channel, no transform
            new Channel(8, x => x * 2) -> Buffered channel, with transform
    */


    // An optional pipeline of channels, to be used to pipe values
    // from one channel to multiple others.


    // A FixedQueue containing values ready to be taken.


    // A List containing any puts to be appended to the end of the channel

    function Channel() {
        (0, _classCallCheck3.default)(this, Channel);
        this.puts = new _dataStructures.List();
        this.tails = new _dataStructures.List();
        this.takes = new _dataStructures.List();
        this.buf = null;
        this.transform = null;
        this.pipeline = [];
        this.waiting = [];

        var size = null;
        var transform = null;
        if (typeof (arguments.length <= 0 ? undefined : arguments[0]) === 'function') transform = arguments.length <= 0 ? undefined : arguments[0];
        if (typeof (arguments.length <= 0 ? undefined : arguments[0]) === 'number') {
            size = arguments.length <= 0 ? undefined : arguments[0];
            if ((arguments.length <= 1 ? undefined : arguments[1]) && typeof (arguments.length <= 1 ? undefined : arguments[1]) === 'function') transform = arguments.length <= 1 ? undefined : arguments[1];
        }
        this.transform = transform;
        this[STATE] = STATES.OPEN;

        if (size) {
            this.buf = new _dataStructures.FixedQueue(size);
            this[SLIDER] = _bufferedSlide;
        } else this[SLIDER] = _slide;
    }

    /*
        A helper constructor which will convert any iterable into a channel,
        placing all of the iterable's values onto that channel.
    */


    // An optional array of promises, to be resolved when the channel is marked as finished.


    // An optional function to used to transform values passing through the channel.


    // A List containing any takes waiting for values to be provided


    // A List containing any puts which could not be placed directly onto the buffer


    (0, _createClass3.default)(Channel, [{
        key: 'close',
        // we have a timing problem with pipes.. this resolves it, but is hacky.


        /*
            Calls Channel.close for `this`, `all`.
        */
        value: function close() {
            var all = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            return Channel.close(this, all);
        }

        /*
            Determines if a channel
            has any values left for `take` to use.
        */

    }, {
        key: 'empty',


        /*
            Returns Channel.empty for `this`.
        */
        value: function empty() {
            return Channel.empty(this);
        }

        /*
            Places a new value onto the provided channel.
             If the buffer is full, the promise will be pushed
            onto Channel.puts to be resolved when buffer space is available.
        */

    }, {
        key: 'put',


        /*
            Returns Channel.put for `this`, `val`.
        */
        value: function put(val) {
            return Channel.put(this, val);
        }

        /*
            Takes the first value from the provided channel.
             If no value is provided, the promise will be pushed
            onto Channel.takes to be resolved when a value is available.
        */

    }, {
        key: 'take',


        /*
            Returns Channel.take for `this`.
        */
        value: function take() {
            return Channel.take(this);
        }
    }, {
        key: 'tail',


        /*
            Returns Channel.tail for `this`.
        */
        value: function tail(val) {
            return Channel.tail(this, val);
        }

        /*
            Helper method for putting values onto a channel
            from a provided producer whenever there is space.
        */

    }, {
        key: 'produce',


        /*
            Calls Channel.produce for `this`, `producer`.
        */
        value: function produce(producer) {
            return Channel.produce(this, producer);
        }

        /*
            Helper method for executing a provided consumer
            each time a channel value is available.
        */

    }, {
        key: 'consume',


        /*
            Calls Channel.consume for `this`, `consumer`.
        */
        value: function consume() {
            var consumer = arguments.length <= 0 || arguments[0] === undefined ? function () {} : arguments[0];

            return Channel.consume(this, consumer);
        }

        /*
            Registers a promise to be resolved
            when the channel has fully ended.
        */

    }, {
        key: 'done',


        /*
            Returns Channel.done for `this`.
        */
        value: function done() {
            return Channel.done(this);
        }

        /*
            Automatically builds a set of channels
            for the provided function arguments,
            setting up a pipe from the first channel
            all the way down to the last channel.
             Returns references to both
            the first and the last channel.
        */

    }, {
        key: 'pipe',


        /*
            Returns Channel.pipe for `this`, `...channels`.
        */
        value: function pipe() {
            for (var _len = arguments.length, channels = Array(_len), _key = 0; _key < _len; _key++) {
                channels[_key] = arguments[_key];
            }

            return Channel.pipe.apply(Channel, [this].concat(channels));
        }

        /*
            Pipes all provided channels into a new, single destination.
        */

    }, {
        key: 'merge',


        /*
            Returns Channel.merge for `this`, `...channels`.
        */
        value: function merge() {
            for (var _len2 = arguments.length, channels = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                channels[_key2] = arguments[_key2];
            }

            return Channel.merge.apply(Channel, [this].concat(channels));
        }
    }, {
        key: 'unpipe',
        value: function unpipe() {
            for (var _len3 = arguments.length, channels = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                channels[_key3] = arguments[_key3];
            }

            return Channel.unpipe.apply(Channel, [this].concat(channels));
        }
    }, {
        key: 'state',


        /*
            Sets the state of the channel.
        */
        set: function set(val) {
            this[STATE] = val;
        }

        /*
            Gets the state of the channel.
        */
        ,
        get: function get() {
            return this[STATE];
        }

        /*
            Gets the length of the channel,
            which is interpreted as the current length of the buffer
            added to any puts which are waiting for space in the buffer.
        */

    }, {
        key: 'length',
        get: function get() {
            if (this.buf) return this.buf.length + this.puts.length;
            return this.puts.length;
        }

        /*
            Gets the size of the channel,
            which is interpreted as the size of the buffer.
        */

    }, {
        key: 'size',
        get: function get() {
            return this.buf ? this.buf.size : undefined;
        }

        /*
            Marks a channel to no longer be writable.
             Accepts an optional boolean `all`, to signify
            whether or not to close the entire pipeline.
        */

    }], [{
        key: 'from',
        value: function from(iterable) {
            var keepOpen = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            var arr = [].concat((0, _toConsumableArray3.default)(iterable));
            var ch = new Channel(arr.length);
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = (0, _getIterator3.default)(arr), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _val = _step.value;

                    ch.buf.push(_val);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            if (!keepOpen) ch.close(true);
            return ch;
        }
    }, {
        key: 'close',
        value: function close(ch) {
            var all = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            ch.state = STATES.CLOSED;
            if (all) ch[SHOULD_CLOSE] = true;
            setTimeout(function () {
                return slide(ch);
            });
        }
    }, {
        key: 'empty',
        value: function empty(ch) {
            if (ch.buf) return ch.buf.empty() && ch.puts.empty();
            return ch.puts.empty();
        }
    }, {
        key: 'put',
        value: function put(ch, val) {
            return new _promise2.default(function (resolve) {
                if (ch.state !== STATES.OPEN) return resolve(ACTIONS.DONE);
                var put = wrap(val, ch.transform, resolve);
                ch.puts.push(put);
                slide(ch);
            });
        }
    }, {
        key: 'take',
        value: function take(ch) {
            return new _promise2.default(function (resolve) {
                if (ch.state === STATES.ENDED) return resolve(ACTIONS.DONE);
                ch.takes.push(resolve);
                slide(ch);
            });
        }
    }, {
        key: 'tail',
        value: function tail(ch, val) {
            return new _promise2.default(function (resolve) {
                if (ch.state !== STATES.OPEN) return resolve(ACTIONS.DONE);
                var tail = wrap(val, ch.transform, resolve);
                ch.tails.push(tail);
                slide(ch);
            });
        }
    }, {
        key: 'produce',
        value: function () {
            var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(ch, producer) {
                var _this4 = this;

                var spin;
                return _regenerator2.default.wrap(function _callee9$(_context12) {
                    while (1) {
                        switch (_context12.prev = _context12.next) {
                            case 0:
                                spin = true;

                                (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8() {
                                    var _val2, r;

                                    return _regenerator2.default.wrap(function _callee8$(_context11) {
                                        while (1) {
                                            switch (_context11.prev = _context11.next) {
                                                case 0:
                                                    _context11.prev = 0;

                                                case 1:
                                                    if (!spin) {
                                                        _context11.next = 18;
                                                        break;
                                                    }

                                                    _val2 = producer();

                                                    if (!(_val2 instanceof _promise2.default)) {
                                                        _context11.next = 9;
                                                        break;
                                                    }

                                                    _context11.next = 6;
                                                    return _val2;

                                                case 6:
                                                    _val2 = _context11.sent;
                                                    _context11.next = 11;
                                                    break;

                                                case 9:
                                                    _context11.next = 11;
                                                    return timeout();

                                                case 11:
                                                    _context11.next = 13;
                                                    return Channel.put(ch, _val2);

                                                case 13:
                                                    r = _context11.sent;

                                                    if (!(r === ACTIONS.DONE)) {
                                                        _context11.next = 16;
                                                        break;
                                                    }

                                                    return _context11.abrupt('break', 18);

                                                case 16:
                                                    _context11.next = 1;
                                                    break;

                                                case 18:
                                                    _context11.next = 23;
                                                    break;

                                                case 20:
                                                    _context11.prev = 20;
                                                    _context11.t0 = _context11['catch'](0);

                                                    expose(_context11.t0);

                                                case 23:
                                                case 'end':
                                                    return _context11.stop();
                                            }
                                        }
                                    }, _callee8, _this4, [[0, 20]]);
                                }))();
                                return _context12.abrupt('return', function () {
                                    spin = false;
                                });

                            case 3:
                            case 'end':
                                return _context12.stop();
                        }
                    }
                }, _callee9, this);
            }));

            function produce(_x10, _x11) {
                return ref.apply(this, arguments);
            }

            return produce;
        }()
    }, {
        key: 'consume',
        value: function () {
            var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11(ch) {
                var _this5 = this;

                var consumer = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];
                return _regenerator2.default.wrap(function _callee11$(_context14) {
                    while (1) {
                        switch (_context14.prev = _context14.next) {
                            case 0:
                                ch[IS_CONSUMING] = true;
                                (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10() {
                                    var taking, _val3, consuming;

                                    return _regenerator2.default.wrap(function _callee10$(_context13) {
                                        while (1) {
                                            switch (_context13.prev = _context13.next) {
                                                case 0:
                                                    taking = Channel.take(ch);

                                                case 1:
                                                    if (!ch[IS_CONSUMING]) {
                                                        _context13.next = 13;
                                                        break;
                                                    }

                                                    _context13.next = 4;
                                                    return taking;

                                                case 4:
                                                    _val3 = _context13.sent;

                                                    if (!(_val3 === ACTIONS.DONE)) {
                                                        _context13.next = 7;
                                                        break;
                                                    }

                                                    return _context13.abrupt('break', 13);

                                                case 7:
                                                    consuming = consumer(_val3);

                                                    taking = Channel.take(ch);
                                                    _context13.next = 11;
                                                    return consuming;

                                                case 11:
                                                    _context13.next = 1;
                                                    break;

                                                case 13:
                                                    ch[IS_CONSUMING] = false;

                                                    if (!ch[IS_FLUSHING]) {
                                                        _context13.next = 19;
                                                        break;
                                                    }

                                                    _context13.next = 17;
                                                    return ch[IS_FLUSHING];

                                                case 17:
                                                    _context13.next = 20;
                                                    break;

                                                case 19:
                                                    finish(ch);

                                                case 20:
                                                case 'end':
                                                    return _context13.stop();
                                            }
                                        }
                                    }, _callee10, _this5);
                                }))();

                            case 2:
                            case 'end':
                                return _context14.stop();
                        }
                    }
                }, _callee11, this);
            }));

            function consume(_x12, _x13) {
                return ref.apply(this, arguments);
            }

            return consume;
        }()
    }, {
        key: 'done',
        value: function done(ch) {
            return new _promise2.default(function (resolve) {
                if (ch.state === STATES.ENDED) return resolve();
                ch.waiting.push(resolve);
            });
        }
    }, {
        key: 'pipeline',
        value: function pipeline() {
            for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                args[_key4] = arguments[_key4];
            }

            var first = null;
            var last = null;
            if (args.length === 0) {
                first = new Channel();
                last = first;
            } else {
                if (Array.isArray(args[0])) args = [].concat((0, _toConsumableArray3.default)(args[0]));
                var _channels = args.filter(function (x) {
                    return x instanceof Function || x instanceof Channel;
                }).map(function (x) {
                    return x instanceof Channel ? x : new Channel(x);
                });
                first = _channels[0];
                last = _channels.reduce(function (x, y) {
                    return x.pipe(y);
                });
            }
            return [first, last];
        }

        /*
            Builds a pipeline from a parent channel
            to one or more children.
             This will automatically pipe values from
            the parent onto each of the children.
             (dev note: careful, errors which are thrown from here
             do NOT bubble up to the user yet in nodejs.
             will be fixed in the future, supposedly).
        */

    }, {
        key: 'pipe',
        value: function pipe(parent) {
            var _parent$pipeline,
                _this6 = this;

            for (var _len5 = arguments.length, channels = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
                channels[_key5 - 1] = arguments[_key5];
            }

            channels = channels.map(function (x) {
                return x instanceof Function ? new Channel(x) : x;
            });
            (_parent$pipeline = parent.pipeline).push.apply(_parent$pipeline, (0, _toConsumableArray3.default)(channels));
            if (!parent[ACTIONS.CANCEL]) {
                (function () {
                    var running = true;
                    (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee12() {
                        var _loop3, _ret9;

                        return _regenerator2.default.wrap(function _callee12$(_context16) {
                            while (1) {
                                switch (_context16.prev = _context16.next) {
                                    case 0:
                                        _loop3 = _regenerator2.default.mark(function _loop3() {
                                            var val, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, channel;

                                            return _regenerator2.default.wrap(function _loop3$(_context15) {
                                                while (1) {
                                                    switch (_context15.prev = _context15.next) {
                                                        case 0:
                                                            _context15.next = 2;
                                                            return parent.take();

                                                        case 2:
                                                            val = _context15.sent;

                                                            if (!(val === ACTIONS.DONE)) {
                                                                _context15.next = 25;
                                                                break;
                                                            }

                                                            if (!parent[SHOULD_CLOSE]) {
                                                                _context15.next = 24;
                                                                break;
                                                            }

                                                            _iteratorNormalCompletion2 = true;
                                                            _didIteratorError2 = false;
                                                            _iteratorError2 = undefined;
                                                            _context15.prev = 8;

                                                            for (_iterator2 = (0, _getIterator3.default)(parent.pipeline); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                                                channel = _step2.value;

                                                                channel.close(true);
                                                            }_context15.next = 16;
                                                            break;

                                                        case 12:
                                                            _context15.prev = 12;
                                                            _context15.t0 = _context15['catch'](8);
                                                            _didIteratorError2 = true;
                                                            _iteratorError2 = _context15.t0;

                                                        case 16:
                                                            _context15.prev = 16;
                                                            _context15.prev = 17;

                                                            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                                                _iterator2.return();
                                                            }

                                                        case 19:
                                                            _context15.prev = 19;

                                                            if (!_didIteratorError2) {
                                                                _context15.next = 22;
                                                                break;
                                                            }

                                                            throw _iteratorError2;

                                                        case 22:
                                                            return _context15.finish(19);

                                                        case 23:
                                                            return _context15.finish(16);

                                                        case 24:
                                                            return _context15.abrupt('return', 'break');

                                                        case 25:
                                                            _context15.next = 27;
                                                            return _promise2.default.all(parent.pipeline.map(function (x) {
                                                                return x.put(val);
                                                            }));

                                                        case 27:
                                                        case 'end':
                                                            return _context15.stop();
                                                    }
                                                }
                                            }, _loop3, _this6, [[8, 12, 16, 24], [17,, 19, 23]]);
                                        });

                                    case 1:
                                        if (!running) {
                                            _context16.next = 8;
                                            break;
                                        }

                                        return _context16.delegateYield(_loop3(), 't0', 3);

                                    case 3:
                                        _ret9 = _context16.t0;

                                        if (!(_ret9 === 'break')) {
                                            _context16.next = 6;
                                            break;
                                        }

                                        return _context16.abrupt('break', 8);

                                    case 6:
                                        _context16.next = 1;
                                        break;

                                    case 8:
                                    case 'end':
                                        return _context16.stop();
                                }
                            }
                        }, _callee12, _this6);
                    }))();
                    // eslint-disable-line no-loop-func
                    parent[ACTIONS.CANCEL] = function () {
                        running = false;
                    };
                })();
            }
            return channels[channels.length - 1];
        }
    }, {
        key: 'merge',
        value: function merge() {
            var child = new Channel();

            for (var _len6 = arguments.length, channels = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
                channels[_key6] = arguments[_key6];
            }

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = (0, _getIterator3.default)(channels), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var parent = _step3.value;

                    parent.pipe(child);
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            return child;
        }
    }, {
        key: 'unpipe',
        value: function unpipe(parent) {
            for (var _len7 = arguments.length, channels = Array(_len7 > 1 ? _len7 - 1 : 0), _key7 = 1; _key7 < _len7; _key7++) {
                channels[_key7 - 1] = arguments[_key7];
            }

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = (0, _getIterator3.default)((0, _entries2.default)(parent.pipeline)), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var _step4$value = (0, _slicedToArray3.default)(_step4.value, 2);

                    var index = _step4$value[0];
                    var pipe = _step4$value[1];
                    var _iteratorNormalCompletion5 = true;
                    var _didIteratorError5 = false;
                    var _iteratorError5 = undefined;

                    try {
                        for (var _iterator5 = (0, _getIterator3.default)(channels), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                            var ch2 = _step5.value;

                            if (pipe === ch2) parent.pipeline.splice(index, 1);
                        }
                    } catch (err) {
                        _didIteratorError5 = true;
                        _iteratorError5 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                _iterator5.return();
                            }
                        } finally {
                            if (_didIteratorError5) {
                                throw _iteratorError5;
                            }
                        }
                    }
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            if (parent.pipeline.length === 0 && parent[ACTIONS.CANCEL]) parent[ACTIONS.CANCEL](); // don't spin the automatic pipe method when no pipeline is attached
            return parent;
        }
    }]);
    return Channel;
}();

Channel.DONE = ACTIONS.DONE; // expose this so loops can listen for it

exports.default = Channel;