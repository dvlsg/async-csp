"use strict";

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _toConsumableArray = require('babel-runtime/helpers/to-consumable-array')['default'];

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _Symbol = require('babel-runtime/core-js/symbol')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _Array$entries = require('babel-runtime/core-js/array/entries')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.timeout = timeout;

var _dataStructuresJs = require('./data-structures.js');

var log = console.log.bind(console); // eslint-disable-line no-unused-vars

/*
    Three possible states:

    OPEN   : The Channel can be written to and taken from freely.
    CLOSED : The Channel can no longer be written to, but still has values to be taken.
    ENDED  : The Channel is closed, and no longer has values to be taken.
*/
var STATES = {
    OPEN: _Symbol('channel_open'),
    CLOSED: _Symbol('channel_closed'),
    ENDED: _Symbol('channel_ended')
};

exports.STATES = STATES;
var ACTIONS = {
    // channel has just been closed, and has no more values to take
    DONE: _Symbol('channel_done'),
    CANCEL: _Symbol('channel_cancel')
};

exports.ACTIONS = ACTIONS;
var SLIDER = _Symbol('channel_slider');
var STATE = _Symbol('channel_state');
var SHOULD_CLOSE = _Symbol('channel_should_close');
var IS_CONSUMING = _Symbol('channel_consuming');
var IS_FLUSHING = _Symbol('channel_flushing');
var IS_SLIDING = _Symbol('channel_sliding');

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
    while (waiting = ch.waiting.shift()) // eslint-disable-line no-cond-assign
    waiting();
}

/*
    Flushes out any remaining takes from the channel
    by sending them the value of `ACTIONS.DONE`.
*/
function flush(ch) {
    var take, takes;
    return _regeneratorRuntime.async(function flush$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                if (ch.empty()) {
                    context$1$0.next = 2;
                    break;
                }

                throw new Error('Attempted to execute flush(Channel) on a non-empty channel!');

            case 2:
                if (!ch[IS_FLUSHING]) {
                    context$1$0.next = 4;
                    break;
                }

                return context$1$0.abrupt('return');

            case 4:
                ch[IS_FLUSHING] = true;
                take = null, takes = [];

                while (take = ch.takes.shift()) // eslint-disable-line no-cond-assign
                takes.push(take(ACTIONS.DONE));
                context$1$0.next = 9;
                return _regeneratorRuntime.awrap(_Promise.all(takes));

            case 9:
                if (!ch[IS_CONSUMING]) finish(ch);
                ch[IS_FLUSHING] = false;

            case 11:
            case 'end':
                return context$1$0.stop();
        }
    }, null, this);
}

function wrap(val, transform, resolve) {
    var _this = this;

    var wrapped = null;
    if (transform instanceof Function) {
        if (transform.length === 1) {
            wrapped = function callee$1$0() {
                var transformed, actual;
                return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
                    while (1) switch (context$2$0.prev = context$2$0.next) {
                        case 0:
                            transformed = transform(val);

                            if (!(transformed instanceof _Promise)) {
                                context$2$0.next = 6;
                                break;
                            }

                            context$2$0.next = 4;
                            return _regeneratorRuntime.awrap(transformed);

                        case 4:
                            actual = context$2$0.sent;
                            return context$2$0.abrupt('return', actual);

                        case 6:
                            return context$2$0.abrupt('return', transformed);

                        case 7:
                        case 'end':
                            return context$2$0.stop();
                    }
                }, null, _this);
            };
        } else {
            (function () {
                var accepted = new _dataStructuresJs.List();
                if (transform.length === 2) {
                    wrapped = function callee$2$0() {
                        return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                            while (1) switch (context$3$0.prev = context$3$0.next) {
                                case 0:
                                    context$3$0.next = 2;
                                    return _regeneratorRuntime.awrap(transform(val, function (acc) {
                                        if (typeof acc !== 'undefined') accepted.push(acc);
                                    }));

                                case 2:
                                    return context$3$0.abrupt('return', accepted);

                                case 3:
                                case 'end':
                                    return context$3$0.stop();
                            }
                        }, null, _this);
                    };
                } else /* transform.length === 3 */{
                        wrapped = function () {
                            return new _Promise(function (res) {
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
        wrapped = function callee$1$0() {
            return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
                while (1) switch (context$2$0.prev = context$2$0.next) {
                    case 0:
                        return context$2$0.abrupt('return', val);

                    case 1:
                    case 'end':
                        return context$2$0.stop();
                }
            }, null, _this);
        };
    }
    return {
        wrapped: wrapped,
        resolve: resolve,
        transform: transform,
        val: val
    };
}

function _bufferedSlide(ch) {
    var _loop, put;

    return _regeneratorRuntime.async(function _bufferedSlide$(context$1$0) {
        var _this2 = this;

        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                _loop = function callee$1$0() {
                    var buf, val, take, put;
                    return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
                        while (1) switch (context$2$0.prev = context$2$0.next) {
                            case 0:
                                buf = ch.buf.shift();
                                val = null;

                                if (!(buf && buf.wrapped)) {
                                    context$2$0.next = 8;
                                    break;
                                }

                                context$2$0.next = 5;
                                return _regeneratorRuntime.awrap(buf.wrapped());

                            case 5:
                                val = context$2$0.sent;
                                context$2$0.next = 9;
                                break;

                            case 8:
                                val = buf;

                            case 9:
                                // this is a special case caused by `from`. can we get rid of the need for this?
                                if (typeof val !== 'undefined') {
                                    if (val instanceof _dataStructuresJs.List) {
                                        (function () {
                                            // need a way to distinguish this as a "special" array return
                                            var accepted = [].concat(_toConsumableArray(val));
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

                                                        (_ch$buf = ch.buf).unshift.apply(_ch$buf, _toConsumableArray(wrappers)); // this can expand beyond the actual buffer size. unintuitive?
                                                    })();
                                                }
                                        })();
                                    } else {
                                            take = ch.takes.shift();

                                            take(val);
                                        }
                                }
                                if (!ch.puts.empty() && !ch.buf.full()) {
                                    put = ch.puts.shift();

                                    ch.buf.push(put);
                                    put.resolve();
                                }

                            case 11:
                            case 'end':
                                return context$2$0.stop();
                        }
                    }, null, _this2);
                };

            case 1:
                if (!(!ch.buf.empty() && !ch.takes.empty())) {
                    context$1$0.next = 6;
                    break;
                }

                context$1$0.next = 4;
                return _regeneratorRuntime.awrap(_loop());

            case 4:
                context$1$0.next = 1;
                break;

            case 6:
                while (!ch.puts.empty() && !ch.buf.full()) {
                    put = ch.puts.shift();

                    ch.buf.push(put);
                    put.resolve();
                }

            case 7:
            case 'end':
                return context$1$0.stop();
        }
    }, null, this);
}

function _slide(ch) {
    var _loop2;

    return _regeneratorRuntime.async(function _slide$(context$1$0) {
        var _this3 = this;

        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                _loop2 = function callee$1$0() {
                    var put, val, take;
                    return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
                        while (1) switch (context$2$0.prev = context$2$0.next) {
                            case 0:
                                put = ch.puts.shift();
                                context$2$0.next = 3;
                                return _regeneratorRuntime.awrap(put.wrapped());

                            case 3:
                                val = context$2$0.sent;

                                if (typeof val !== 'undefined') {
                                    if (val instanceof _dataStructuresJs.List) {
                                        (function () {
                                            // need a way to distinguish this as a "special" array return
                                            var accepted = [].concat(_toConsumableArray(val));
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
                                                        (_ch$puts = ch.puts).unshift.apply(_ch$puts, _toConsumableArray(wrappers));
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
                                return context$2$0.stop();
                        }
                    }, null, _this3);
                };

            case 1:
                if (!(!ch.takes.empty() && !ch.puts.empty())) {
                    context$1$0.next = 6;
                    break;
                }

                context$1$0.next = 4;
                return _regeneratorRuntime.awrap(_loop2());

            case 4:
                context$1$0.next = 1;
                break;

            case 6:
            case 'end':
                return context$1$0.stop();
        }
    }, null, this);
}

function canSlide(ch) {
    return ch.buf ? !ch.buf.full() && !ch.puts.empty() || !ch.takes.empty() && !ch.buf.empty() : !ch.takes.empty() && !ch.puts.empty();
}

function slide(ch) {
    var _ch$puts2;

    return _regeneratorRuntime.async(function slide$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                if (!ch[IS_SLIDING]) {
                    context$1$0.next = 2;
                    break;
                }

                return context$1$0.abrupt('return');

            case 2:
                ch[IS_SLIDING] = true;

            case 3:
                if (!canSlide(ch)) {
                    context$1$0.next = 8;
                    break;
                }

                context$1$0.next = 6;
                return _regeneratorRuntime.awrap(ch[SLIDER](ch));

            case 6:
                context$1$0.next = 3;
                break;

            case 8:
                if (!(ch[STATE] === STATES.CLOSED && !ch.tails.empty() && (ch.buf ? ch.buf.empty() : true) && ch.puts.empty())) {
                    context$1$0.next = 16;
                    break;
                }

                (_ch$puts2 = ch.puts).unshift.apply(_ch$puts2, _toConsumableArray(ch.tails));
                ch.tails = new _dataStructuresJs.List(); // need a way to empty out the list

            case 11:
                if (!canSlide(ch)) {
                    context$1$0.next = 16;
                    break;
                }

                context$1$0.next = 14;
                return _regeneratorRuntime.awrap(ch[SLIDER](ch));

            case 14:
                context$1$0.next = 11;
                break;

            case 16:

                if ((ch[STATE] === STATES.CLOSED || ch[STATE] === STATES.ENDED) && (ch.buf ? ch.buf.empty() : true) && ch.puts.empty() && ch.tails.empty()) flush(ch);

                ch[IS_SLIDING] = false;

            case 18:
            case 'end':
                return context$1$0.stop();
        }
    }, null, this);
}

function timeout() {
    var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

    return new _Promise(function (resolve) {
        setTimeout(resolve, delay);
    });
}

var Channel = (function () {

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

    function Channel() {
        _classCallCheck(this, Channel);

        var size = null;
        var transform = null;
        if (typeof arguments[0] === 'function') transform = arguments[0];
        if (typeof arguments[0] === 'number') {
            size = arguments[0];
            if (arguments[1] && typeof arguments[1] === 'function') transform = arguments[1];
        }
        this.puts = new _dataStructuresJs.List();
        this.tails = new _dataStructuresJs.List();
        this.takes = new _dataStructuresJs.List();
        this.transform = transform;
        this.pipeline = [];
        this.waiting = [];
        this[STATE] = STATES.OPEN;

        if (size) {
            this.buf = new _dataStructuresJs.FixedQueue(size);
            this[SLIDER] = _bufferedSlide;
        } else this[SLIDER] = _slide;
    }

    /*
        A helper constructor which will convert any iterable into a channel,
        placing all of the iterable's values onto that channel.
    */

    _createClass(Channel, [{
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
        },

        /*
            Gets the state of the channel.
        */
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

            var arr = [].concat(_toConsumableArray(iterable));
            var ch = new Channel(arr.length);
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = _getIterator(arr), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var val = _step.value;

                    ch.buf.push(val);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator['return']) {
                        _iterator['return']();
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
            return new _Promise(function (resolve) {
                if (ch.state !== STATES.OPEN) return resolve(ACTIONS.DONE);
                var put = wrap(val, ch.transform, resolve);
                ch.puts.push(put);
                slide(ch);
            });
        }
    }, {
        key: 'take',
        value: function take(ch) {
            return new _Promise(function (resolve) {
                if (ch.state === STATES.ENDED) return resolve(ACTIONS.DONE);
                ch.takes.push(resolve);
                slide(ch);
            });
        }
    }, {
        key: 'tail',
        value: function tail(ch, val) {
            return new _Promise(function (resolve) {
                if (ch.state !== STATES.OPEN) return resolve(ACTIONS.DONE);
                var tail = wrap(val, ch.transform, resolve);
                ch.tails.push(tail);
                slide(ch);
            });
        }
    }, {
        key: 'produce',
        value: function produce(ch, producer) {
            var spin;
            return _regeneratorRuntime.async(function produce$(context$2$0) {
                var _this4 = this;

                while (1) switch (context$2$0.prev = context$2$0.next) {
                    case 0:
                        spin = true;

                        (function callee$2$0() {
                            var val, r;
                            return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                                while (1) switch (context$3$0.prev = context$3$0.next) {
                                    case 0:
                                        context$3$0.prev = 0;

                                    case 1:
                                        if (!spin) {
                                            context$3$0.next = 18;
                                            break;
                                        }

                                        val = producer();

                                        if (!(val instanceof _Promise)) {
                                            context$3$0.next = 9;
                                            break;
                                        }

                                        context$3$0.next = 6;
                                        return _regeneratorRuntime.awrap(val);

                                    case 6:
                                        val = context$3$0.sent;
                                        context$3$0.next = 11;
                                        break;

                                    case 9:
                                        context$3$0.next = 11;
                                        return _regeneratorRuntime.awrap(timeout());

                                    case 11:
                                        context$3$0.next = 13;
                                        return _regeneratorRuntime.awrap(Channel.put(ch, val));

                                    case 13:
                                        r = context$3$0.sent;

                                        if (!(r === ACTIONS.DONE)) {
                                            context$3$0.next = 16;
                                            break;
                                        }

                                        return context$3$0.abrupt('break', 18);

                                    case 16:
                                        context$3$0.next = 1;
                                        break;

                                    case 18:
                                        context$3$0.next = 23;
                                        break;

                                    case 20:
                                        context$3$0.prev = 20;
                                        context$3$0.t0 = context$3$0['catch'](0);

                                        expose(context$3$0.t0);

                                    case 23:
                                    case 'end':
                                        return context$3$0.stop();
                                }
                            }, null, _this4, [[0, 20]]);
                        })();
                        return context$2$0.abrupt('return', function () {
                            spin = false;
                        });

                    case 3:
                    case 'end':
                        return context$2$0.stop();
                }
            }, null, this);
        }
    }, {
        key: 'consume',
        value: function consume(ch) {
            var consumer = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];
            return _regeneratorRuntime.async(function consume$(context$2$0) {
                var _this5 = this;

                while (1) switch (context$2$0.prev = context$2$0.next) {
                    case 0:
                        ch[IS_CONSUMING] = true;
                        (function callee$2$0() {
                            var taking, val, consuming;
                            return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                                while (1) switch (context$3$0.prev = context$3$0.next) {
                                    case 0:
                                        taking = Channel.take(ch);

                                    case 1:
                                        if (!ch[IS_CONSUMING]) {
                                            context$3$0.next = 13;
                                            break;
                                        }

                                        context$3$0.next = 4;
                                        return _regeneratorRuntime.awrap(taking);

                                    case 4:
                                        val = context$3$0.sent;

                                        if (!(val === ACTIONS.DONE)) {
                                            context$3$0.next = 7;
                                            break;
                                        }

                                        return context$3$0.abrupt('break', 13);

                                    case 7:
                                        consuming = consumer(val);

                                        taking = Channel.take(ch);
                                        context$3$0.next = 11;
                                        return _regeneratorRuntime.awrap(consuming);

                                    case 11:
                                        context$3$0.next = 1;
                                        break;

                                    case 13:
                                        ch[IS_CONSUMING] = false;

                                        if (!ch[IS_FLUSHING]) {
                                            context$3$0.next = 19;
                                            break;
                                        }

                                        context$3$0.next = 17;
                                        return _regeneratorRuntime.awrap(ch[IS_FLUSHING]);

                                    case 17:
                                        context$3$0.next = 20;
                                        break;

                                    case 19:
                                        finish(ch);

                                    case 20:
                                    case 'end':
                                        return context$3$0.stop();
                                }
                            }, null, _this5);
                        })();

                    case 2:
                    case 'end':
                        return context$2$0.stop();
                }
            }, null, this);
        }
    }, {
        key: 'done',
        value: function done(ch) {
            return new _Promise(function (resolve) {
                if (ch.state === STATES.ENDED) return resolve();
                ch.waiting.push(resolve);
            });
        }
    }, {
        key: 'pipeline',
        value: function pipeline() {
            var channels = [];
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _len4 = arguments.length, functions = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                    functions[_key4] = arguments[_key4];
                }

                for (var _iterator2 = _getIterator(functions), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var fn = _step2.value;

                    channels.push(new Channel(fn));
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                        _iterator2['return']();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            channels.reduce(function (x, y) {
                return x.pipe(y);
            });
            return [channels[0], channels[channels.length - 1]];
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
                _this7 = this;

            for (var _len5 = arguments.length, channels = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
                channels[_key5 - 1] = arguments[_key5];
            }

            (_parent$pipeline = parent.pipeline).push.apply(_parent$pipeline, channels);
            if (!parent[ACTIONS.CANCEL]) {
                (function () {
                    var running = true;
                    (function callee$3$0() {
                        var _loop3, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, _ret9;

                        return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
                            var _this6 = this;

                            while (1) switch (context$4$0.prev = context$4$0.next) {
                                case 0:
                                    _loop3 = function callee$4$0() {
                                        var val, channel;
                                        return _regeneratorRuntime.async(function callee$4$0$(context$5$0) {
                                            while (1) switch (context$5$0.prev = context$5$0.next) {
                                                case 0:
                                                    context$5$0.next = 2;
                                                    return _regeneratorRuntime.awrap(parent.take());

                                                case 2:
                                                    val = context$5$0.sent;

                                                    if (!(val === ACTIONS.DONE)) {
                                                        context$5$0.next = 25;
                                                        break;
                                                    }

                                                    if (!parent[SHOULD_CLOSE]) {
                                                        context$5$0.next = 24;
                                                        break;
                                                    }

                                                    _iteratorNormalCompletion3 = true;
                                                    _didIteratorError3 = false;
                                                    _iteratorError3 = undefined;
                                                    context$5$0.prev = 8;

                                                    for (_iterator3 = _getIterator(parent.pipeline); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                                        channel = _step3.value;

                                                        channel.close(true);
                                                    }context$5$0.next = 16;
                                                    break;

                                                case 12:
                                                    context$5$0.prev = 12;
                                                    context$5$0.t0 = context$5$0['catch'](8);
                                                    _didIteratorError3 = true;
                                                    _iteratorError3 = context$5$0.t0;

                                                case 16:
                                                    context$5$0.prev = 16;
                                                    context$5$0.prev = 17;

                                                    if (!_iteratorNormalCompletion3 && _iterator3['return']) {
                                                        _iterator3['return']();
                                                    }

                                                case 19:
                                                    context$5$0.prev = 19;

                                                    if (!_didIteratorError3) {
                                                        context$5$0.next = 22;
                                                        break;
                                                    }

                                                    throw _iteratorError3;

                                                case 22:
                                                    return context$5$0.finish(19);

                                                case 23:
                                                    return context$5$0.finish(16);

                                                case 24:
                                                    return context$5$0.abrupt('return', 'break');

                                                case 25:
                                                    context$5$0.next = 27;
                                                    return _regeneratorRuntime.awrap(_Promise.all(parent.pipeline.map(function (x) {
                                                        return x.put(val);
                                                    })));

                                                case 27:
                                                case 'end':
                                                    return context$5$0.stop();
                                            }
                                        }, null, _this6, [[8, 12, 16, 24], [17,, 19, 23]]);
                                    };

                                case 1:
                                    if (!running) {
                                        context$4$0.next = 9;
                                        break;
                                    }

                                    context$4$0.next = 4;
                                    return _regeneratorRuntime.awrap(_loop3());

                                case 4:
                                    _ret9 = context$4$0.sent;

                                    if (!(_ret9 === 'break')) {
                                        context$4$0.next = 7;
                                        break;
                                    }

                                    return context$4$0.abrupt('break', 9);

                                case 7:
                                    context$4$0.next = 1;
                                    break;

                                case 9:
                                case 'end':
                                    return context$4$0.stop();
                            }
                        }, null, _this7);
                    })();
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
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _len6 = arguments.length, channels = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
                    channels[_key6] = arguments[_key6];
                }

                for (var _iterator4 = _getIterator(channels), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var _parent = _step4.value;

                    _parent.pipe(child);
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4['return']) {
                        _iterator4['return']();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            return child;
        }
    }, {
        key: 'unpipe',
        value: function unpipe(parent) {
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _len7 = arguments.length, channels = Array(_len7 > 1 ? _len7 - 1 : 0), _key7 = 1; _key7 < _len7; _key7++) {
                    channels[_key7 - 1] = arguments[_key7];
                }

                for (var _iterator5 = _getIterator(_Array$entries(parent.pipeline)), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var _step5$value = _slicedToArray(_step5.value, 2);

                    var index = _step5$value[0];
                    var pipe = _step5$value[1];
                    var _iteratorNormalCompletion6 = true;
                    var _didIteratorError6 = false;
                    var _iteratorError6 = undefined;

                    try {
                        for (var _iterator6 = _getIterator(channels), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                            var ch2 = _step6.value;

                            if (pipe === ch2) parent.pipeline.splice(index, 1);
                        }
                    } catch (err) {
                        _didIteratorError6 = true;
                        _iteratorError6 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion6 && _iterator6['return']) {
                                _iterator6['return']();
                            }
                        } finally {
                            if (_didIteratorError6) {
                                throw _iteratorError6;
                            }
                        }
                    }
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5['return']) {
                        _iterator5['return']();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            if (parent.pipeline.length === 0 && parent[ACTIONS.CANCEL]) parent[ACTIONS.CANCEL](); // don't spin the automatic pipe method when no pipeline is attached
            return parent;
        }
    }]);

    return Channel;
})();

exports['default'] = Channel;

Channel.DONE = ACTIONS.DONE; // expose this so loops can listen for it

// this error is never expected to be thrown
// just a sanity check during development

// A List containing any puts which could not be placed directly onto the buffer

// A List containing any takes waiting for values to be provided

// A FixedQueue containing values ready to be taken.

// An optional function to used to transform values passing through the channel.

// An optional pipeline of channels, to be used to pipe values
// from one channel to multiple others.

// An optional array of promises, to be resolved when the channel is marked as finished.
// noop default