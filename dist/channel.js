"use strict";

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _toConsumableArray = require('babel-runtime/helpers/to-consumable-array')['default'];

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _Symbol = require('babel-runtime/core-js/symbol')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

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
    ch.state = STATES.ENDED;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = _getIterator(ch.waiting), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var waiting = _step.value;

            setImmediate(waiting);
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
}

/*
    Flushes out any remaining takes from the channel
    by sending them the value of `ACTIONS.DONE`.
*/
function flush(ch) {
    if (!ch.empty())
        // this error is never expected to be thrown
        // just a sanity check during development
        throw new Error('Attempted to execute flush(Channel) on a non-empty channel!');
    if (ch[IS_FLUSHING]) return ch[IS_FLUSHING];
    ch[IS_FLUSHING] = new _Promise(function (resolve) {
        var take = undefined,
            takes = [];
        while (take = ch.takes.shift()) // eslint-disable-line no-cond-assign
        takes.push(take(ACTIONS.DONE));
        return _Promise.all(takes).then(function () {
            //eslint-disable-line consistent-return
            // silly compatibility stuff with Channel.consume()
            // up for refactor in the future, but works for now.
            ch[IS_FLUSHING] = null; // scary.
            setImmediate(resolve); // best spot for this?
            if (!ch[IS_CONSUMING]) return finish(ch);
            // else consumer is expected to finish when completed
        });
    });
    return ch[IS_FLUSHING];
}

function _slide(ch) {
    var put, val, take;
    return _regeneratorRuntime.async(function _slide$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                if (!(!ch.buf.full() && !ch.puts.empty())) {
                    context$1$0.next = 7;
                    break;
                }

                put = ch.puts.shift();
                context$1$0.next = 4;
                return _regeneratorRuntime.awrap(put());

            case 4:
                if (!ch.takes.empty() && !ch.buf.empty()) {
                    val = ch.buf.shift();
                    take = ch.takes.shift();

                    take(val);
                }
                context$1$0.next = 0;
                break;

            case 7:
                while (!ch.takes.empty() && !ch.buf.empty()) {
                    val = ch.buf.shift();
                    take = ch.takes.shift();

                    take(val);
                }

            case 8:
            case 'end':
                return context$1$0.stop();
        }
    }, null, this);
}

function slide(ch) {
    var deferred, resolve;
    return _regeneratorRuntime.async(function slide$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                if (!ch[IS_SLIDING]) {
                    context$1$0.next = 2;
                    break;
                }

                return context$1$0.abrupt('return', ch[IS_SLIDING]);

            case 2:
                deferred = new _Promise(function (res) {
                    // eslint-disable-line no-unused-vars
                    ch[IS_SLIDING] = res;
                });
                context$1$0.next = 5;
                return _regeneratorRuntime.awrap(_slide(ch));

            case 5:
                if (!(!ch.buf.full() && !ch.puts.empty() || !ch.takes.empty() && !ch.buf.empty())) {
                    context$1$0.next = 10;
                    break;
                }

                context$1$0.next = 8;
                return _regeneratorRuntime.awrap(_slide(ch));

            case 8:
                context$1$0.next = 5;
                break;

            case 10:
                resolve = ch[IS_SLIDING];

                ch[IS_SLIDING] = null;
                resolve();

                if (!(ch[STATE] === STATES.CLOSED && ch.buf.empty() && ch.puts.empty())) {
                    context$1$0.next = 16;
                    break;
                }

                context$1$0.next = 16;
                return _regeneratorRuntime.awrap(flush(ch));

            case 16:
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
            new Channel()            -> Default sized channel, no transform
            new Channel(x => x*2)    -> Default sized channel, with transform
            new Channel(8)           -> Specified sized channel, no transform
            new Channel(8, x => x*2) -> Specified sized channel, with transform
    */

    function Channel() {
        _classCallCheck(this, Channel);

        var size = Channel.DEFAULT_SIZE;
        var transform = function transform(x) {
            return x;
        };
        if (typeof arguments[0] === 'function') transform = arguments[0];
        if (typeof arguments[0] === 'number') {
            size = arguments[0];
            if (arguments[1] && typeof arguments[1] === 'function') transform = arguments[1];
        }
        this.puts = new _dataStructuresJs.List();
        this.takes = new _dataStructuresJs.List();
        this.buf = new _dataStructuresJs.FixedQueue(size);
        this.transform = transform;
        this.pipeline = [];
        this.waiting = [];
        this[STATE] = STATES.OPEN;
    }

    /*
        A helper constructor which will convert any iterable into a channel,
        placing all of the iterable's values onto that channel.
    */

    _createClass(Channel, [{
        key: 'close',

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

        // UNTESTED. CARE.
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
            return this.buf.length + this.puts.length;
        }

        /*
            Gets the size of the channel,
            which is interpreted as the size of the buffer.
        */
    }, {
        key: 'size',
        get: function get() {
            return this.buf.size;
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
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = _getIterator(arr), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var val = _step2.value;

                    ch.buf.push(val);
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

            if (!keepOpen) ch.close(true);
            return ch;
        }
    }, {
        key: 'close',
        value: function close(ch) {
            var all = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            ch.state = STATES.CLOSED;
            if (all) ch[SHOULD_CLOSE] = true;
            return slide(ch).then(function () {
                return flush(ch);
            });
        }
    }, {
        key: 'empty',
        value: function empty(ch) {
            return ch.buf.empty() && ch.puts.empty();
        }
    }, {
        key: 'put',
        value: function put(ch, val) {
            var _this = this;

            return new _Promise(function (resolve, reject) {
                // eslint-disable-line no-unused-vars
                if (ch.state !== STATES.OPEN) return resolve(ACTIONS.DONE);
                if (ch.transform instanceof Function) {
                    if (ch.transform.length === 1) {
                        ch.puts.push(function callee$3$0() {
                            var transformed;
                            return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
                                while (1) switch (context$4$0.prev = context$4$0.next) {
                                    case 0:
                                        context$4$0.next = 2;
                                        return _regeneratorRuntime.awrap(ch.transform(val));

                                    case 2:
                                        transformed = context$4$0.sent;

                                        if (typeof transformed !== 'undefined') ch.buf.push(transformed);
                                        return context$4$0.abrupt('return', resolve());

                                    case 5:
                                    case 'end':
                                        return context$4$0.stop();
                                }
                            }, null, _this);
                        });
                    } else {
                        (function () {
                            // transform length of either 2 or 3
                            var accepted = [];
                            var done = function done() {
                                var promises = [];

                                var _loop = function (i) {
                                    var acc = accepted[i];
                                    var p = new _Promise(function (res) {
                                        // eslint-disable-line no-loop-func
                                        ch.puts.unshift(function callee$7$0() {
                                            return _regeneratorRuntime.async(function callee$7$0$(context$8$0) {
                                                while (1) switch (context$8$0.prev = context$8$0.next) {
                                                    case 0:
                                                        // eslint-disable-line no-loop-func
                                                        ch.buf.push(acc);
                                                        res();

                                                    case 2:
                                                    case 'end':
                                                        return context$8$0.stop();
                                                }
                                            }, null, _this);
                                        });
                                    });
                                    promises.push(p);
                                };

                                for (var i = accepted.length - 1; i >= 0; i--) {
                                    _loop(i);
                                }
                                _Promise.all(promises).then(resolve)['catch'](reject);
                                slide(ch); // necessary, but why?
                            };
                            if (ch.transform.length === 2) {
                                ch.puts.push(function callee$4$0() {
                                    return _regeneratorRuntime.async(function callee$4$0$(context$5$0) {
                                        while (1) switch (context$5$0.prev = context$5$0.next) {
                                            case 0:
                                                context$5$0.next = 2;
                                                return _regeneratorRuntime.awrap(ch.transform(val, function (acc) {
                                                    if (typeof acc !== 'undefined') accepted.push(acc);
                                                }));

                                            case 2:
                                                done();

                                            case 3:
                                            case 'end':
                                                return context$5$0.stop();
                                        }
                                    }, null, _this);
                                });
                            } else {
                                ch.puts.push(function callee$4$0() {
                                    return _regeneratorRuntime.async(function callee$4$0$(context$5$0) {
                                        while (1) switch (context$5$0.prev = context$5$0.next) {
                                            case 0:
                                                ch.transform(val, function (acc) {
                                                    if (typeof acc !== 'undefined') accepted.push(acc);
                                                }, done);

                                            case 1:
                                            case 'end':
                                                return context$5$0.stop();
                                        }
                                    }, null, _this);
                                });
                            }
                        })();
                    }
                } else {
                    // no transform method available
                    ch.puts.push(function callee$3$0() {
                        return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
                            while (1) switch (context$4$0.prev = context$4$0.next) {
                                case 0:
                                    ch.buf.push(val);
                                    return context$4$0.abrupt('return', resolve());

                                case 2:
                                case 'end':
                                    return context$4$0.stop();
                            }
                        }, null, _this);
                    });
                }
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
        key: 'produce',
        value: function produce(ch, producer) {
            var spin;
            return _regeneratorRuntime.async(function produce$(context$2$0) {
                var _this2 = this;

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
                            }, null, _this2, [[0, 20]]);
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
                var _this3 = this;

                while (1) switch (context$2$0.prev = context$2$0.next) {
                    case 0:
                        ch[IS_CONSUMING] = true;
                        (function callee$2$0() {
                            var val;
                            return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                                while (1) switch (context$3$0.prev = context$3$0.next) {
                                    case 0:
                                        if (!ch[IS_CONSUMING]) {
                                            context$3$0.next = 10;
                                            break;
                                        }

                                        context$3$0.next = 3;
                                        return _regeneratorRuntime.awrap(Channel.take(ch));

                                    case 3:
                                        val = context$3$0.sent;

                                        if (!(val === ACTIONS.DONE)) {
                                            context$3$0.next = 6;
                                            break;
                                        }

                                        return context$3$0.abrupt('break', 10);

                                    case 6:
                                        context$3$0.next = 8;
                                        return _regeneratorRuntime.awrap(consumer(val));

                                    case 8:
                                        context$3$0.next = 0;
                                        break;

                                    case 10:
                                        ch[IS_CONSUMING] = false;

                                        if (!ch[IS_FLUSHING]) {
                                            context$3$0.next = 16;
                                            break;
                                        }

                                        context$3$0.next = 14;
                                        return _regeneratorRuntime.awrap(ch[IS_FLUSHING]);

                                    case 14:
                                        context$3$0.next = 17;
                                        break;

                                    case 16:
                                        finish(ch);

                                    case 17:
                                    case 'end':
                                        return context$3$0.stop();
                                }
                            }, null, _this3);
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
                if (ch.state === STATES.ENDED) return resolve();else ch.waiting.push(function () {
                    resolve();
                });
            });
        }
    }, {
        key: 'pipeline',
        value: function pipeline() {
            var channels = [];
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _len4 = arguments.length, functions = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                    functions[_key4] = arguments[_key4];
                }

                for (var _iterator3 = _getIterator(functions), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var fn = _step3.value;

                    channels.push(new Channel(fn));
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3['return']) {
                        _iterator3['return']();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
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
                _this5 = this;

            for (var _len5 = arguments.length, channels = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
                channels[_key5 - 1] = arguments[_key5];
            }

            (_parent$pipeline = parent.pipeline).push.apply(_parent$pipeline, channels);
            if (!parent[ACTIONS.CANCEL]) {
                (function () {
                    var running = true;
                    (function callee$3$0() {
                        var _loop2, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, _ret4;

                        return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
                            var _this4 = this;

                            while (1) switch (context$4$0.prev = context$4$0.next) {
                                case 0:
                                    _loop2 = function callee$4$0() {
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

                                                    _iteratorNormalCompletion4 = true;
                                                    _didIteratorError4 = false;
                                                    _iteratorError4 = undefined;
                                                    context$5$0.prev = 8;

                                                    for (_iterator4 = _getIterator(parent.pipeline); !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                                        channel = _step4.value;

                                                        channel.close(true);
                                                    }context$5$0.next = 16;
                                                    break;

                                                case 12:
                                                    context$5$0.prev = 12;
                                                    context$5$0.t0 = context$5$0['catch'](8);
                                                    _didIteratorError4 = true;
                                                    _iteratorError4 = context$5$0.t0;

                                                case 16:
                                                    context$5$0.prev = 16;
                                                    context$5$0.prev = 17;

                                                    if (!_iteratorNormalCompletion4 && _iterator4['return']) {
                                                        _iterator4['return']();
                                                    }

                                                case 19:
                                                    context$5$0.prev = 19;

                                                    if (!_didIteratorError4) {
                                                        context$5$0.next = 22;
                                                        break;
                                                    }

                                                    throw _iteratorError4;

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
                                        }, null, _this4, [[8, 12, 16, 24], [17,, 19, 23]]);
                                    };

                                case 1:
                                    if (!running) {
                                        context$4$0.next = 9;
                                        break;
                                    }

                                    context$4$0.next = 4;
                                    return _regeneratorRuntime.awrap(_loop2());

                                case 4:
                                    _ret4 = context$4$0.sent;

                                    if (!(_ret4 === 'break')) {
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
                        }, null, _this5);
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
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _len6 = arguments.length, channels = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
                    channels[_key6] = arguments[_key6];
                }

                for (var _iterator5 = _getIterator(channels), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var _parent = _step5.value;

                    _parent.pipe(child);
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

            return child;
        }
    }, {
        key: 'unpipe',
        value: function unpipe(parent) {
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _len7 = arguments.length, channels = Array(_len7 > 1 ? _len7 - 1 : 0), _key7 = 1; _key7 < _len7; _key7++) {
                    channels[_key7 - 1] = arguments[_key7];
                }

                for (var _iterator6 = _getIterator(_Array$entries(parent.pipeline)), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var _step6$value = _slicedToArray(_step6.value, 2);

                    var index = _step6$value[0];
                    var pipe = _step6$value[1];
                    var _iteratorNormalCompletion7 = true;
                    var _didIteratorError7 = false;
                    var _iteratorError7 = undefined;

                    try {
                        for (var _iterator7 = _getIterator(channels), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                            var ch2 = _step7.value;

                            if (pipe === ch2) parent.pipeline.splice(index, 1);
                        }
                    } catch (err) {
                        _didIteratorError7 = true;
                        _iteratorError7 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion7 && _iterator7['return']) {
                                _iterator7['return']();
                            }
                        } finally {
                            if (_didIteratorError7) {
                                throw _iteratorError7;
                            }
                        }
                    }
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

            if (parent.pipeline.length === 0 && parent[ACTIONS.CANCEL]) parent[ACTIONS.CANCEL](); // don't spin the automatic pipe method when no pipeline is attached
            return parent;
        }
    }]);

    return Channel;
})();

exports['default'] = Channel;

Channel.DEFAULT_SIZE = 8;
Channel.DONE = ACTIONS.DONE; // expose this so loops can listen for it

// boo, deferred pattern, but we need to await for an unknown number of times.
// consider something else in the future. maybe make _slide directly recursive with a final resolve?
// performance concern?

// A List containing any puts which could not be placed directly onto the buffer

// A List containing any takes waiting for values to be provided

// A FixedQueue containing values ready to be taken.

// An optional function to used to transform values passing through the channel.

// An optional pipeline of channels, to be used to pipe values
// from one channel to multiple others.

// An optional array of promises, to be resolved when the channel is marked as finished.
// noop default