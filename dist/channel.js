'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

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
/* eslint no-cond-assign: 0 */ // intentional while loop assign in flush
/* eslint no-unused-vars: 0 */ // so we can have log, even when not using it
/* eslint no-empty: 0 */ // intentional empty block inside Channel.produce()

var _dataStructuresJs = require('./data-structures.js');

var log = console.log.bind(console);

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
var SHOULD_CLOSE = _Symbol('channel_should_close');
var CHANNEL_SOURCE = _Symbol('channel_source');
var IS_PIPED = _Symbol('channel_piped'); // TBD -- do we need this?

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
    Shifts and returns a value inside the channel
    from either the buffer or the puts.
*/
function shift(ch) {
    if (ch.empty())
        // this error is never expected to be thrown
        // just a sanity check during development
        throw new Error('Attempted to execute shift(Channel) on an empty channel!');

    if (ch.buf.empty()) {
        ch.puts.shift()();
        return ch.buf.shift();
    } else {
        var val = ch.buf.shift();
        if (!ch.puts.empty()) ch.puts.shift()();
        return val;
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

    var take = null;
    while (take = ch.takes.shift()) take(ACTIONS.DONE);
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
            var _waiting = _step.value;

            _waiting();
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

function timeout() {
    var delay = arguments[0] === undefined ? 0 : arguments[0];

    return new _Promise(function (resolve, reject) {
        setTimeout(resolve, delay);
    });
}

var STATE = _Symbol('channel_state');

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
        this.puts = new _dataStructuresJs.Queue();
        this.takes = new _dataStructuresJs.Queue();
        this.spacing = new _dataStructuresJs.Queue();
        this.buf = new _dataStructuresJs.FixedQueue(size);
        this.transform = transform;
        this.pipeline = [];
        this.waiting = [];
        this.spaces = []; // new name, if necessary
        this[STATE] = STATES.OPEN;
    }

    _createClass(Channel, [{
        key: 'close',

        /*
            Calls Channel.close for `this`, `all`.
        */
        value: function close() {
            var all = arguments[0] === undefined ? false : arguments[0];

            Channel.close(this, all);
        }
    }, {
        key: 'empty',

        /*
            Returns Channel.empty for `this`.
        */
        value: function empty() {
            return Channel.empty(this);
        }
    }, {
        key: 'refill',

        /*
            Returns `Channel.refill` for `this`.
        */
        value: function refill() {
            return Channel.refill(this);
        }
    }, {
        key: 'spend',
        value: function spend() {
            return Channel.spend(this);
        }
    }, {
        key: 'put',

        /*
            Returns Channel.put for `this`, `val`.
        */
        value: function put(val) {
            return Channel.put(this, val);
        }
    }, {
        key: 'take',

        /*
            Returns Channel.take for `this`.
        */
        value: function take() {
            return Channel.take(this);
        }
    }, {
        key: 'produce',

        /*
            Calls Channel.produce for `this`, `producer`.
        */
        value: function produce(producer) {
            return Channel.produce(this, producer);
        }
    }, {
        key: 'consume',

        /*
            Calls Channel.consume for `this`, `consumer`.
        */
        value: function consume() {
            var consumer = arguments[0] === undefined ? function () {} : arguments[0];

            return Channel.consume(this, consumer);
        }
    }, {
        key: 'done',

        /*
            Returns Channel.done for `this`.
        */
        value: function done() {
            return Channel.done(this);
        }
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
    }, {
        key: 'length',

        /*
            Gets the length of the channel,
            which is interpreted as the current length of the buffer
            added to any puts which are waiting for space in the buffer.
        */
        get: function get() {
            return this.buf.length + this.puts.length;
        }
    }, {
        key: 'size',

        /*
            Gets the size of the channel,
            which is interpreted as the size of the buffer.
        */
        get: function get() {
            return this.buf.size;
        }
    }], [{
        key: 'from',

        /*
            A helper constructor which will convert any iterable into a channel,
            placing all of the iterable's values onto that channel.
        */
        value: function from(iterable) {
            var keepOpen = arguments[1] === undefined ? false : arguments[1];

            var ch = new Channel();
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = _getIterator(iterable), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var val = _step2.value;

                    ch.put(val);
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

            if (!keepOpen) ch.close(true); // potentially breaking change
            return ch;
        }
    }, {
        key: 'close',

        /*
            Marks a channel to no longer be writable.
              Accepts an optional boolean `all`, to signify
            whether or not to close the entire pipeline.
        */
        value: function close(ch) {
            var all = arguments[1] === undefined ? false : arguments[1];

            ch.state = STATES.CLOSED;
            if (ch.empty()) {
                flush(ch);
                finish(ch);
            }
            if (all) ch[SHOULD_CLOSE] = true;
        }
    }, {
        key: 'empty',

        /*
            Determines if a channel
            has any values left for `take` to use.
        */
        value: function empty(ch) {
            return ch.buf.empty() && ch.puts.empty();
        }
    }, {
        key: 'put',

        /*
            Places a new value onto the provided channel.
              If the buffer is full, the promise will be pushed
            onto Channel.puts to be resolved when buffer space is available.
        */
        value: function put(ch, val) {
            return new _Promise(function (resolve) {
                if (ch.state !== STATES.OPEN) return resolve(ACTIONS.DONE);

                if (ch.transform && typeof ch.transform === 'function') {
                    if (ch.transform.length === 1) {
                        // we have a transform with a callback length of 1
                        // the user will have the option to return undefined (to drop)
                        // or to return a transformed version of the value (to accept)
                        ch.puts.push(function () {
                            val = ch.transform(val);
                            if (typeof val !== 'undefined') ch.buf.push(val); // need val to be scoped for later execution
                            return resolve();
                        });
                    } else {
                        var _iteratorNormalCompletion3;

                        var _didIteratorError3;

                        var _iteratorError3;

                        var _iterator3, _step3;

                        var _ret = (function () {
                            // we have a transform with a callback length of 2
                            // the user will be passed a method used to determine
                            // whether or not values should be accepted by callback
                            var accepted = [];
                            ch.transform(val, function (acc) {
                                if (typeof acc !== 'undefined') accepted.push(acc);
                            });

                            // once we have an array of accepted values from the user,
                            // determine what exactly to do with them

                            if (accepted.length === 0) {
                                // no values accepted
                                return {
                                    v: resolve()
                                };
                            } else if (accepted.length === 1) {
                                // only one value accepted, take the shortcut out
                                ch.puts.push(function () {
                                    ch.buf.push(accepted[0]);
                                    return resolve();
                                });
                            } else {
                                // multiple values accepted, gets
                                // resolve the original put promise
                                // only when all of the expanded puts
                                // have been properly consumed by takes
                                // log('accepting:', accepted);
                                var promises = [];
                                _iteratorNormalCompletion3 = true;
                                _didIteratorError3 = false;
                                _iteratorError3 = undefined;

                                try {
                                    var _loop = function () {
                                        var acc = _step3.value;

                                        var p = new _Promise(function (res) {
                                            ch.puts.push(function () {
                                                ch.buf.push(acc);
                                                return res();
                                            });
                                        });
                                        promises.push(p);
                                    };

                                    for (_iterator3 = _getIterator(accepted); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                        _loop();
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

                                _Promise.all(promises).then(resolve)['catch'](expose); // resolve the original
                            }
                        })();

                        if (typeof _ret === 'object') return _ret.v;
                    }
                } else {
                    // no transform method available
                    ch.puts.push(function () {
                        ch.buf.push(val);
                        return resolve();
                    });
                }
                ch.refill();
                ch.spend();
            });
        }
    }, {
        key: 'refill',

        /*
            Refills the buffer with any available puts.
        */
        value: function refill(ch) {
            while (!ch.buf.full() && !ch.puts.empty()) ch.puts.shift()();
        }
    }, {
        key: 'spend',

        /*
            Loops through and uses any available takes.
        */
        value: function spend(ch) {
            while (!ch.takes.empty() && !ch.buf.empty()) ch.takes.shift()(shift(ch));
        }
    }, {
        key: 'take',

        /*
            Takes the first value from the provided channel.
              If no value is provided, the promise will be pushed
            onto Channel.takes to be resolved when a value is available.
        */
        value: function take(ch) {
            return new _Promise(function (resolve) {
                if (ch.state === STATES.ENDED) return resolve(Channel.DONE);
                ch.takes.push(function (x) {
                    return resolve(x);
                });
                if (!ch.empty()) {
                    var val = shift(ch);
                    var take = ch.takes.shift();
                    take(val);
                }
                if (ch.state === STATES.CLOSED) {
                    flush(ch);
                    finish(ch); // order?
                }
            });
        }
    }, {
        key: 'produce',

        /*
            Helper method for putting values onto a channel
            from a provided producer whenever there is space.
        */
        value: function produce(ch, producer) {
            var spin;
            return _regeneratorRuntime.async(function produce$(context$2$0) {
                var _this = this;

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
                                        return _regeneratorRuntime.awrap(ch.put(val));

                                    case 13:
                                        r = context$3$0.sent;

                                        if (!(r === Channel.DONE)) {
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
                            }, null, _this, [[0, 20]]);
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

        /*
            Helper method for executing a provided consumer
            each time a channel value is available.
        */
        value: function consume(ch) {
            var consumer = arguments[1] === undefined ? function () {} // noop default
            : arguments[1];
            var spin;
            return _regeneratorRuntime.async(function consume$(context$2$0) {
                var _this2 = this;

                while (1) switch (context$2$0.prev = context$2$0.next) {
                    case 0:
                        spin = true;

                        (function callee$2$0() {
                            var val;
                            return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                                while (1) switch (context$3$0.prev = context$3$0.next) {
                                    case 0:
                                        val = null;

                                    case 1:
                                        context$3$0.next = 3;
                                        return _regeneratorRuntime.awrap(ch.take());

                                    case 3:
                                        context$3$0.t0 = val = context$3$0.sent;
                                        context$3$0.t1 = Channel.DONE;

                                        if (!(context$3$0.t0 !== context$3$0.t1)) {
                                            context$3$0.next = 16;
                                            break;
                                        }

                                        context$3$0.prev = 6;
                                        context$3$0.next = 9;
                                        return _regeneratorRuntime.awrap(consumer(val));

                                    case 9:
                                        context$3$0.next = 14;
                                        break;

                                    case 11:
                                        context$3$0.prev = 11;
                                        context$3$0.t2 = context$3$0['catch'](6);

                                        expose(context$3$0.t2);

                                    case 14:
                                        context$3$0.next = 1;
                                        break;

                                    case 16:
                                    case 'end':
                                        return context$3$0.stop();
                                }
                            }, null, _this2, [[6, 11]]);
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
        key: 'done',

        /*
            Registers a promise to be resolved
            when the channel has fully ended.
        */
        value: function done(ch) {
            return new _Promise(function (resolve, reject) {
                if (ch.state === STATES.ENDED) return resolve();else ch.waiting.push(function () {
                    resolve();
                });
            });
        }
    }, {
        key: 'pipeline',

        /*
            Automatically builds a set of channels
            for the provided function arguments,
            setting up a pipe from the first channel
            all the way down to the last channel.
              Returns references to both
            the first and the last channel.
        */
        value: function pipeline() {
            var channels = [];
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _len4 = arguments.length, functions = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                    functions[_key4] = arguments[_key4];
                }

                for (var _iterator4 = _getIterator(functions), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var fn = _step4.value;

                    channels.push(new Channel(1, fn));
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

            channels.reduce(function (x, y) {
                return x.pipe(y);
            });
            return [channels[0], channels[channels.length - 1]];
        }
    }, {
        key: 'pipe',

        /*
            Builds a pipeline from a parent channel
            to one or more children.
              This will automatically pipe values from
            the parent onto each of the children.
              (dev note: careful, errors which are thrown from here
             do NOT bubble up to the user yet in nodejs.
             will be fixed in the future, supposedly).
        */
        value: function pipe(parent) {
            var _parent$pipeline,
                _this4 = this;

            for (var _len5 = arguments.length, channels = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
                channels[_key5 - 1] = arguments[_key5];
            }

            (_parent$pipeline = parent.pipeline).push.apply(_parent$pipeline, channels);
            if (!parent[ACTIONS.CANCEL]) {
                (function () {
                    var running = true;
                    (function callee$3$0() {
                        var _loop2, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, _ret4;

                        return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
                            var _this3 = this;

                            while (1) switch (context$4$0.prev = context$4$0.next) {
                                case 0:
                                    _loop2 = function callee$4$0() {
                                        var take, val, channel;
                                        return _regeneratorRuntime.async(function callee$4$0$(context$5$0) {
                                            while (1) switch (context$5$0.prev = context$5$0.next) {
                                                case 0:
                                                    take = parent.take();

                                                    take[CHANNEL_SOURCE] = parent;
                                                    context$5$0.next = 4;
                                                    return _regeneratorRuntime.awrap(take);

                                                case 4:
                                                    val = context$5$0.sent;

                                                    if (!(val === Channel.DONE)) {
                                                        context$5$0.next = 27;
                                                        break;
                                                    }

                                                    if (!parent[SHOULD_CLOSE]) {
                                                        context$5$0.next = 26;
                                                        break;
                                                    }

                                                    _iteratorNormalCompletion5 = true;
                                                    _didIteratorError5 = false;
                                                    _iteratorError5 = undefined;
                                                    context$5$0.prev = 10;

                                                    for (_iterator5 = _getIterator(parent.pipeline); !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                                        channel = _step5.value;

                                                        channel.close(true);
                                                    }context$5$0.next = 18;
                                                    break;

                                                case 14:
                                                    context$5$0.prev = 14;
                                                    context$5$0.t0 = context$5$0['catch'](10);
                                                    _didIteratorError5 = true;
                                                    _iteratorError5 = context$5$0.t0;

                                                case 18:
                                                    context$5$0.prev = 18;
                                                    context$5$0.prev = 19;

                                                    if (!_iteratorNormalCompletion5 && _iterator5['return']) {
                                                        _iterator5['return']();
                                                    }

                                                case 21:
                                                    context$5$0.prev = 21;

                                                    if (!_didIteratorError5) {
                                                        context$5$0.next = 24;
                                                        break;
                                                    }

                                                    throw _iteratorError5;

                                                case 24:
                                                    return context$5$0.finish(21);

                                                case 25:
                                                    return context$5$0.finish(18);

                                                case 26:
                                                    return context$5$0.abrupt('return', 'break');

                                                case 27:
                                                    context$5$0.next = 29;
                                                    return _regeneratorRuntime.awrap(_Promise.all(parent.pipeline.map(function (x) {
                                                        return x.put(val);
                                                    })));

                                                case 29:
                                                case 'end':
                                                    return context$5$0.stop();
                                            }
                                        }, null, _this3, [[10, 14, 18, 26], [19,, 21, 25]]);
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
                        }, null, _this4);
                    })();
                    parent[ACTIONS.CANCEL] = function () {
                        running = false;
                    };
                })();
            }
            return channels[channels.length - 1];
        }
    }, {
        key: 'merge',

        /*
            Pipes all provided channels into a new, single destination.
        */
        value: function merge() {
            var child = new Channel();
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _len6 = arguments.length, channels = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
                    channels[_key6] = arguments[_key6];
                }

                for (var _iterator6 = _getIterator(channels), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var _parent = _step6.value;

                    _parent.pipe(child);
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

            return child;
        }
    }, {
        key: 'unpipe',

        // UNTESTED. CARE.
        value: function unpipe(parent) {
            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = _getIterator(_Array$entries(parent.pipeline)), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var _step7$value = _slicedToArray(_step7.value, 2);

                    var index = _step7$value[0];
                    var pipe = _step7$value[1];
                    var _iteratorNormalCompletion8 = true;
                    var _didIteratorError8 = false;
                    var _iteratorError8 = undefined;

                    try {
                        for (var _len7 = arguments.length, channels = Array(_len7 > 1 ? _len7 - 1 : 0), _key7 = 1; _key7 < _len7; _key7++) {
                            channels[_key7 - 1] = arguments[_key7];
                        }

                        for (var _iterator8 = _getIterator(channels), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                            var ch2 = _step8.value;

                            if (pipe === ch2) parent.pipeline.splice(index, 1);
                        }
                    } catch (err) {
                        _didIteratorError8 = true;
                        _iteratorError8 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion8 && _iterator8['return']) {
                                _iterator8['return']();
                            }
                        } finally {
                            if (_didIteratorError8) {
                                throw _iteratorError8;
                            }
                        }
                    }
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

            if (parent.pipeline.length === 0 && parent[ACTIONS.CANCEL]) parent[ACTIONS.CANCEL](); // don't spin the automatic pipe method when no pipeline is attached
            return parent;
        }
    }]);

    return Channel;
})();

exports['default'] = Channel;

Channel.DEFAULT_SIZE = 8;
Channel.DONE = ACTIONS.DONE; // expose this so loops can listen for it

// A queue containing any puts which could not be placed directly onto the buffer

// A queue containing any takes waiting for values to be provided

// A queue containing values ready to be taken.

// An optional function to used to transform values passing through the channel.

// An optional pipeline of channels, to be used to pipe values
// from one channel to multiple others.

// An optional array of promises, to be resolved when the channel is marked as finished.

// HACK WARNING (!!!)
// introduce asynchronous processing when function is synchronous
// to prevent users from shooting themselves in the foot by causing
// unbreakable infinite loops with non async producers.

/* eslint no-loop-func: 0 */