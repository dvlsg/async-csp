(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["async-csp"] = factory();
	else
		root["async-csp"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Channel = exports.ACTIONS = exports.STATES = undefined;

	var _slicedToArray2 = __webpack_require__(1);

	var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

	var _entries = __webpack_require__(58);

	var _entries2 = _interopRequireDefault(_entries);

	var _getIterator2 = __webpack_require__(54);

	var _getIterator3 = _interopRequireDefault(_getIterator2);

	var _typeof2 = __webpack_require__(60);

	var _typeof3 = _interopRequireDefault(_typeof2);

	var _classCallCheck2 = __webpack_require__(76);

	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

	var _createClass2 = __webpack_require__(77);

	var _createClass3 = _interopRequireDefault(_createClass2);

	var _toConsumableArray2 = __webpack_require__(81);

	var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

	var _regenerator = __webpack_require__(88);

	var _regenerator2 = _interopRequireDefault(_regenerator);

	var _promise = __webpack_require__(92);

	var _promise2 = _interopRequireDefault(_promise);

	var _asyncToGenerator2 = __webpack_require__(110);

	var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

	var _symbol = __webpack_require__(63);

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

	var _dataStructures = __webpack_require__(111);

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
	        var buffer = null;
	        if (typeof (arguments.length <= 0 ? undefined : arguments[0]) === 'function') transform = arguments.length <= 0 ? undefined : arguments[0];
	        if (typeof (arguments.length <= 0 ? undefined : arguments[0]) === 'number') {
	            size = arguments.length <= 0 ? undefined : arguments[0];
	            if ((arguments.length <= 1 ? undefined : arguments[1]) && typeof (arguments.length <= 1 ? undefined : arguments[1]) === 'function') transform = arguments.length <= 1 ? undefined : arguments[1];
	        }
	        if ((0, _typeof3.default)(arguments.length <= 0 ? undefined : arguments[0]) === 'object') {
	            // assume first arg is buffer type
	            // consider adding some duck-type or instanceof safety
	            buffer = arguments.length <= 0 ? undefined : arguments[0];
	            if ((arguments.length <= 1 ? undefined : arguments[1]) && typeof (arguments.length <= 1 ? undefined : arguments[1]) === 'function') transform = arguments.length <= 1 ? undefined : arguments[1];
	        }
	        this.transform = transform;
	        this[STATE] = STATES.OPEN;

	        if (size) {
	            this.buf = new _dataStructures.FixedQueue(size);
	            this[SLIDER] = _bufferedSlide;
	        } else if (buffer) {
	            this.buf = buffer;
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

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _isIterable2 = __webpack_require__(2);

	var _isIterable3 = _interopRequireDefault(_isIterable2);

	var _getIterator2 = __webpack_require__(54);

	var _getIterator3 = _interopRequireDefault(_getIterator2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function () {
	  function sliceIterator(arr, i) {
	    var _arr = [];
	    var _n = true;
	    var _d = false;
	    var _e = undefined;

	    try {
	      for (var _i = (0, _getIterator3.default)(arr), _s; !(_n = (_s = _i.next()).done); _n = true) {
	        _arr.push(_s.value);

	        if (i && _arr.length === i) break;
	      }
	    } catch (err) {
	      _d = true;
	      _e = err;
	    } finally {
	      try {
	        if (!_n && _i["return"]) _i["return"]();
	      } finally {
	        if (_d) throw _e;
	      }
	    }

	    return _arr;
	  }

	  return function (arr, i) {
	    if (Array.isArray(arr)) {
	      return arr;
	    } else if ((0, _isIterable3.default)(Object(arr))) {
	      return sliceIterator(arr, i);
	    } else {
	      throw new TypeError("Invalid attempt to destructure non-iterable instance");
	    }
	  };
	}();

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(3), __esModule: true };

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(4);
	__webpack_require__(50);
	module.exports = __webpack_require__(52);

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(5);
	var global        = __webpack_require__(16)
	  , hide          = __webpack_require__(20)
	  , Iterators     = __webpack_require__(8)
	  , TO_STRING_TAG = __webpack_require__(47)('toStringTag');

	for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
	  var NAME       = collections[i]
	    , Collection = global[NAME]
	    , proto      = Collection && Collection.prototype;
	  if(proto && !proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
	  Iterators[NAME] = Iterators.Array;
	}

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var addToUnscopables = __webpack_require__(6)
	  , step             = __webpack_require__(7)
	  , Iterators        = __webpack_require__(8)
	  , toIObject        = __webpack_require__(9);

	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	module.exports = __webpack_require__(13)(Array, 'Array', function(iterated, kind){
	  this._t = toIObject(iterated); // target
	  this._i = 0;                   // next index
	  this._k = kind;                // kind
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , kind  = this._k
	    , index = this._i++;
	  if(!O || index >= O.length){
	    this._t = undefined;
	    return step(1);
	  }
	  if(kind == 'keys'  )return step(0, index);
	  if(kind == 'values')return step(0, O[index]);
	  return step(0, [index, O[index]]);
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	Iterators.Arguments = Iterators.Array;

	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = function(){ /* empty */ };

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = function(done, value){
	  return {value: value, done: !!done};
	};

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = {};

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(10)
	  , defined = __webpack_require__(12);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(11);
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ },
/* 11 */
/***/ function(module, exports) {

	var toString = {}.toString;

	module.exports = function(it){
	  return toString.call(it).slice(8, -1);
	};

/***/ },
/* 12 */
/***/ function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY        = __webpack_require__(14)
	  , $export        = __webpack_require__(15)
	  , redefine       = __webpack_require__(30)
	  , hide           = __webpack_require__(20)
	  , has            = __webpack_require__(31)
	  , Iterators      = __webpack_require__(8)
	  , $iterCreate    = __webpack_require__(32)
	  , setToStringTag = __webpack_require__(46)
	  , getPrototypeOf = __webpack_require__(48)
	  , ITERATOR       = __webpack_require__(47)('iterator')
	  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
	  , FF_ITERATOR    = '@@iterator'
	  , KEYS           = 'keys'
	  , VALUES         = 'values';

	var returnThis = function(){ return this; };

	module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
	  $iterCreate(Constructor, NAME, next);
	  var getMethod = function(kind){
	    if(!BUGGY && kind in proto)return proto[kind];
	    switch(kind){
	      case KEYS: return function keys(){ return new Constructor(this, kind); };
	      case VALUES: return function values(){ return new Constructor(this, kind); };
	    } return function entries(){ return new Constructor(this, kind); };
	  };
	  var TAG        = NAME + ' Iterator'
	    , DEF_VALUES = DEFAULT == VALUES
	    , VALUES_BUG = false
	    , proto      = Base.prototype
	    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
	    , $default   = $native || getMethod(DEFAULT)
	    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
	    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
	    , methods, key, IteratorPrototype;
	  // Fix native
	  if($anyNative){
	    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
	    if(IteratorPrototype !== Object.prototype){
	      // Set @@toStringTag to native iterators
	      setToStringTag(IteratorPrototype, TAG, true);
	      // fix for some old engines
	      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
	    }
	  }
	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if(DEF_VALUES && $native && $native.name !== VALUES){
	    VALUES_BUG = true;
	    $default = function values(){ return $native.call(this); };
	  }
	  // Define iterator
	  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
	    hide(proto, ITERATOR, $default);
	  }
	  // Plug for library
	  Iterators[NAME] = $default;
	  Iterators[TAG]  = returnThis;
	  if(DEFAULT){
	    methods = {
	      values:  DEF_VALUES ? $default : getMethod(VALUES),
	      keys:    IS_SET     ? $default : getMethod(KEYS),
	      entries: $entries
	    };
	    if(FORCED)for(key in methods){
	      if(!(key in proto))redefine(proto, key, methods[key]);
	    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
	  }
	  return methods;
	};

/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = true;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(16)
	  , core      = __webpack_require__(17)
	  , ctx       = __webpack_require__(18)
	  , hide      = __webpack_require__(20)
	  , PROTOTYPE = 'prototype';

	var $export = function(type, name, source){
	  var IS_FORCED = type & $export.F
	    , IS_GLOBAL = type & $export.G
	    , IS_STATIC = type & $export.S
	    , IS_PROTO  = type & $export.P
	    , IS_BIND   = type & $export.B
	    , IS_WRAP   = type & $export.W
	    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
	    , expProto  = exports[PROTOTYPE]
	    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
	    , key, own, out;
	  if(IS_GLOBAL)source = name;
	  for(key in source){
	    // contains in native
	    own = !IS_FORCED && target && target[key] !== undefined;
	    if(own && key in exports)continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
	    // bind timers to global for call from export context
	    : IS_BIND && own ? ctx(out, global)
	    // wrap global constructors for prevent change them in library
	    : IS_WRAP && target[key] == out ? (function(C){
	      var F = function(a, b, c){
	        if(this instanceof C){
	          switch(arguments.length){
	            case 0: return new C;
	            case 1: return new C(a);
	            case 2: return new C(a, b);
	          } return new C(a, b, c);
	        } return C.apply(this, arguments);
	      };
	      F[PROTOTYPE] = C[PROTOTYPE];
	      return F;
	    // make static versions for prototype methods
	    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
	    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
	    if(IS_PROTO){
	      (exports.virtual || (exports.virtual = {}))[key] = out;
	      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
	      if(type & $export.R && expProto && !expProto[key])hide(expProto, key, out);
	    }
	  }
	};
	// type bitmap
	$export.F = 1;   // forced
	$export.G = 2;   // global
	$export.S = 4;   // static
	$export.P = 8;   // proto
	$export.B = 16;  // bind
	$export.W = 32;  // wrap
	$export.U = 64;  // safe
	$export.R = 128; // real proto method for `library` 
	module.exports = $export;

/***/ },
/* 16 */
/***/ function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ },
/* 17 */
/***/ function(module, exports) {

	var core = module.exports = {version: '2.2.1'};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(19);
	module.exports = function(fn, that, length){
	  aFunction(fn);
	  if(that === undefined)return fn;
	  switch(length){
	    case 1: return function(a){
	      return fn.call(that, a);
	    };
	    case 2: return function(a, b){
	      return fn.call(that, a, b);
	    };
	    case 3: return function(a, b, c){
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function(/* ...args */){
	    return fn.apply(that, arguments);
	  };
	};

/***/ },
/* 19 */
/***/ function(module, exports) {

	module.exports = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var dP         = __webpack_require__(21)
	  , createDesc = __webpack_require__(29);
	module.exports = __webpack_require__(25) ? function(object, key, value){
	  return dP.f(object, key, createDesc(1, value));
	} : function(object, key, value){
	  object[key] = value;
	  return object;
	};

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var anObject       = __webpack_require__(22)
	  , IE8_DOM_DEFINE = __webpack_require__(24)
	  , toPrimitive    = __webpack_require__(28)
	  , dP             = Object.defineProperty;

	exports.f = __webpack_require__(25) ? Object.defineProperty : function defineProperty(O, P, Attributes){
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if(IE8_DOM_DEFINE)try {
	    return dP(O, P, Attributes);
	  } catch(e){ /* empty */ }
	  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
	  if('value' in Attributes)O[P] = Attributes.value;
	  return O;
	};

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(23);
	module.exports = function(it){
	  if(!isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ },
/* 23 */
/***/ function(module, exports) {

	module.exports = function(it){
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = !__webpack_require__(25) && !__webpack_require__(26)(function(){
	  return Object.defineProperty(__webpack_require__(27)('div'), 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(26)(function(){
	  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 26 */
/***/ function(module, exports) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(23)
	  , document = __webpack_require__(16).document
	  // in old IE typeof document.createElement is 'object'
	  , is = isObject(document) && isObject(document.createElement);
	module.exports = function(it){
	  return is ? document.createElement(it) : {};
	};

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.1 ToPrimitive(input [, PreferredType])
	var isObject = __webpack_require__(23);
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	module.exports = function(it, S){
	  if(!isObject(it))return it;
	  var fn, val;
	  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  throw TypeError("Can't convert object to primitive value");
	};

/***/ },
/* 29 */
/***/ function(module, exports) {

	module.exports = function(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	};

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(20);

/***/ },
/* 31 */
/***/ function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function(it, key){
	  return hasOwnProperty.call(it, key);
	};

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var create         = __webpack_require__(33)
	  , descriptor     = __webpack_require__(29)
	  , setToStringTag = __webpack_require__(46)
	  , IteratorPrototype = {};

	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	__webpack_require__(20)(IteratorPrototype, __webpack_require__(47)('iterator'), function(){ return this; });

	module.exports = function(Constructor, NAME, next){
	  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
	  setToStringTag(Constructor, NAME + ' Iterator');
	};

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	var anObject    = __webpack_require__(22)
	  , dPs         = __webpack_require__(34)
	  , enumBugKeys = __webpack_require__(44)
	  , IE_PROTO    = __webpack_require__(41)('IE_PROTO')
	  , Empty       = function(){ /* empty */ }
	  , PROTOTYPE   = 'prototype';

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var createDict = function(){
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = __webpack_require__(27)('iframe')
	    , i      = enumBugKeys.length
	    , gt     = '>'
	    , iframeDocument;
	  iframe.style.display = 'none';
	  __webpack_require__(45).appendChild(iframe);
	  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
	  // createDict = iframe.contentWindow.Object;
	  // html.removeChild(iframe);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write('<script>document.F=Object</script' + gt);
	  iframeDocument.close();
	  createDict = iframeDocument.F;
	  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
	  return createDict();
	};

	module.exports = Object.create || function create(O, Properties){
	  var result;
	  if(O !== null){
	    Empty[PROTOTYPE] = anObject(O);
	    result = new Empty;
	    Empty[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO] = O;
	  } else result = createDict();
	  return Properties === undefined ? result : dPs(result, Properties);
	};

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var dP       = __webpack_require__(21)
	  , anObject = __webpack_require__(22)
	  , getKeys  = __webpack_require__(35);

	module.exports = __webpack_require__(25) ? Object.defineProperties : function defineProperties(O, Properties){
	  anObject(O);
	  var keys   = getKeys(Properties)
	    , length = keys.length
	    , i = 0
	    , P;
	  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
	  return O;
	};

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)
	var $keys       = __webpack_require__(36)
	  , enumBugKeys = __webpack_require__(44);

	module.exports = Object.keys || function keys(O){
	  return $keys(O, enumBugKeys);
	};

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	var has          = __webpack_require__(31)
	  , toIObject    = __webpack_require__(9)
	  , arrayIndexOf = __webpack_require__(37)(false)
	  , IE_PROTO     = __webpack_require__(41)('IE_PROTO');

	module.exports = function(object, names){
	  var O      = toIObject(object)
	    , i      = 0
	    , result = []
	    , key;
	  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while(names.length > i)if(has(O, key = names[i++])){
	    ~arrayIndexOf(result, key) || result.push(key);
	  }
	  return result;
	};

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	// false -> Array#indexOf
	// true  -> Array#includes
	var toIObject = __webpack_require__(9)
	  , toLength  = __webpack_require__(38)
	  , toIndex   = __webpack_require__(40);
	module.exports = function(IS_INCLUDES){
	  return function($this, el, fromIndex){
	    var O      = toIObject($this)
	      , length = toLength(O.length)
	      , index  = toIndex(fromIndex, length)
	      , value;
	    // Array#includes uses SameValueZero equality algorithm
	    if(IS_INCLUDES && el != el)while(length > index){
	      value = O[index++];
	      if(value != value)return true;
	    // Array#toIndex ignores holes, Array#includes - not
	    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
	      if(O[index] === el)return IS_INCLUDES || index;
	    } return !IS_INCLUDES && -1;
	  };
	};

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.15 ToLength
	var toInteger = __webpack_require__(39)
	  , min       = Math.min;
	module.exports = function(it){
	  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

/***/ },
/* 39 */
/***/ function(module, exports) {

	// 7.1.4 ToInteger
	var ceil  = Math.ceil
	  , floor = Math.floor;
	module.exports = function(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(39)
	  , max       = Math.max
	  , min       = Math.min;
	module.exports = function(index, length){
	  index = toInteger(index);
	  return index < 0 ? max(index + length, 0) : min(index, length);
	};

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	var shared = __webpack_require__(42)('keys')
	  , uid    = __webpack_require__(43);
	module.exports = function(key){
	  return shared[key] || (shared[key] = uid(key));
	};

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	var global = __webpack_require__(16)
	  , SHARED = '__core-js_shared__'
	  , store  = global[SHARED] || (global[SHARED] = {});
	module.exports = function(key){
	  return store[key] || (store[key] = {});
	};

/***/ },
/* 43 */
/***/ function(module, exports) {

	var id = 0
	  , px = Math.random();
	module.exports = function(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ },
/* 44 */
/***/ function(module, exports) {

	// IE 8- don't enum bug keys
	module.exports = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(16).document && document.documentElement;

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	var def = __webpack_require__(21).f
	  , has = __webpack_require__(31)
	  , TAG = __webpack_require__(47)('toStringTag');

	module.exports = function(it, tag, stat){
	  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
	};

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	var store      = __webpack_require__(42)('wks')
	  , uid        = __webpack_require__(43)
	  , Symbol     = __webpack_require__(16).Symbol
	  , USE_SYMBOL = typeof Symbol == 'function';
	module.exports = function(name){
	  return store[name] || (store[name] =
	    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
	};

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
	var has         = __webpack_require__(31)
	  , toObject    = __webpack_require__(49)
	  , IE_PROTO    = __webpack_require__(41)('IE_PROTO')
	  , ObjectProto = Object.prototype;

	module.exports = Object.getPrototypeOf || function(O){
	  O = toObject(O);
	  if(has(O, IE_PROTO))return O[IE_PROTO];
	  if(typeof O.constructor == 'function' && O instanceof O.constructor){
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectProto : null;
	};

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.13 ToObject(argument)
	var defined = __webpack_require__(12);
	module.exports = function(it){
	  return Object(defined(it));
	};

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $at  = __webpack_require__(51)(true);

	// 21.1.3.27 String.prototype[@@iterator]()
	__webpack_require__(13)(String, 'String', function(iterated){
	  this._t = String(iterated); // target
	  this._i = 0;                // next index
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , index = this._i
	    , point;
	  if(index >= O.length)return {value: undefined, done: true};
	  point = $at(O, index);
	  this._i += point.length;
	  return {value: point, done: false};
	});

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(39)
	  , defined   = __webpack_require__(12);
	// true  -> String#at
	// false -> String#codePointAt
	module.exports = function(TO_STRING){
	  return function(that, pos){
	    var s = String(defined(that))
	      , i = toInteger(pos)
	      , l = s.length
	      , a, b;
	    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	      ? TO_STRING ? s.charAt(i) : a
	      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	var classof   = __webpack_require__(53)
	  , ITERATOR  = __webpack_require__(47)('iterator')
	  , Iterators = __webpack_require__(8);
	module.exports = __webpack_require__(17).isIterable = function(it){
	  var O = Object(it);
	  return O[ITERATOR] !== undefined
	    || '@@iterator' in O
	    || Iterators.hasOwnProperty(classof(O));
	};

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	// getting tag from 19.1.3.6 Object.prototype.toString()
	var cof = __webpack_require__(11)
	  , TAG = __webpack_require__(47)('toStringTag')
	  // ES3 wrong here
	  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function(it, key){
	  try {
	    return it[key];
	  } catch(e){ /* empty */ }
	};

	module.exports = function(it){
	  var O, T, B;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
	    // builtinTag case
	    : ARG ? cof(O)
	    // ES3 arguments fallback
	    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
	};

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(55), __esModule: true };

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(4);
	__webpack_require__(50);
	module.exports = __webpack_require__(56);

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	var anObject = __webpack_require__(22)
	  , get      = __webpack_require__(57);
	module.exports = __webpack_require__(17).getIterator = function(it){
	  var iterFn = get(it);
	  if(typeof iterFn != 'function')throw TypeError(it + ' is not iterable!');
	  return anObject(iterFn.call(it));
	};

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	var classof   = __webpack_require__(53)
	  , ITERATOR  = __webpack_require__(47)('iterator')
	  , Iterators = __webpack_require__(8);
	module.exports = __webpack_require__(17).getIteratorMethod = function(it){
	  if(it != undefined)return it[ITERATOR]
	    || it['@@iterator']
	    || Iterators[classof(it)];
	};

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(59), __esModule: true };

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(5);
	module.exports = __webpack_require__(17).Array.entries;

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _iterator = __webpack_require__(61);

	var _iterator2 = _interopRequireDefault(_iterator);

	var _symbol = __webpack_require__(63);

	var _symbol2 = _interopRequireDefault(_symbol);

	var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default ? "symbol" : typeof obj; };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
	  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
	} : function (obj) {
	  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
	};

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(62), __esModule: true };

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(50);
	__webpack_require__(4);
	module.exports = __webpack_require__(47)('iterator');

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(64), __esModule: true };

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(65);
	__webpack_require__(75);
	module.exports = __webpack_require__(17).Symbol;

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// ECMAScript 6 symbols shim
	var global         = __webpack_require__(16)
	  , core           = __webpack_require__(17)
	  , has            = __webpack_require__(31)
	  , DESCRIPTORS    = __webpack_require__(25)
	  , $export        = __webpack_require__(15)
	  , redefine       = __webpack_require__(30)
	  , META           = __webpack_require__(66).KEY
	  , $fails         = __webpack_require__(26)
	  , shared         = __webpack_require__(42)
	  , setToStringTag = __webpack_require__(46)
	  , uid            = __webpack_require__(43)
	  , wks            = __webpack_require__(47)
	  , keyOf          = __webpack_require__(67)
	  , enumKeys       = __webpack_require__(68)
	  , isArray        = __webpack_require__(71)
	  , anObject       = __webpack_require__(22)
	  , toIObject      = __webpack_require__(9)
	  , toPrimitive    = __webpack_require__(28)
	  , createDesc     = __webpack_require__(29)
	  , _create        = __webpack_require__(33)
	  , gOPNExt        = __webpack_require__(72)
	  , $GOPD          = __webpack_require__(74)
	  , $DP            = __webpack_require__(21)
	  , gOPD           = $GOPD.f
	  , dP             = $DP.f
	  , gOPN           = gOPNExt.f
	  , $Symbol        = global.Symbol
	  , $JSON          = global.JSON
	  , _stringify     = $JSON && $JSON.stringify
	  , setter         = false
	  , PROTOTYPE      = 'prototype'
	  , HIDDEN         = wks('_hidden')
	  , TO_PRIMITIVE   = wks('toPrimitive')
	  , isEnum         = {}.propertyIsEnumerable
	  , SymbolRegistry = shared('symbol-registry')
	  , AllSymbols     = shared('symbols')
	  , ObjectProto    = Object[PROTOTYPE]
	  , USE_NATIVE     = typeof $Symbol == 'function'
	  , QObject        = global.QObject;

	// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var setSymbolDesc = DESCRIPTORS && $fails(function(){
	  return _create(dP({}, 'a', {
	    get: function(){ return dP(this, 'a', {value: 7}).a; }
	  })).a != 7;
	}) ? function(it, key, D){
	  var protoDesc = gOPD(ObjectProto, key);
	  if(protoDesc)delete ObjectProto[key];
	  dP(it, key, D);
	  if(protoDesc && it !== ObjectProto)dP(ObjectProto, key, protoDesc);
	} : dP;

	var wrap = function(tag){
	  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
	  sym._k = tag;
	  DESCRIPTORS && setter && setSymbolDesc(ObjectProto, tag, {
	    configurable: true,
	    set: function(value){
	      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
	      setSymbolDesc(this, tag, createDesc(1, value));
	    }
	  });
	  return sym;
	};

	var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function(it){
	  return typeof it == 'symbol';
	} : function(it){
	  return it instanceof $Symbol;
	};

	var $defineProperty = function defineProperty(it, key, D){
	  anObject(it);
	  key = toPrimitive(key, true);
	  anObject(D);
	  if(has(AllSymbols, key)){
	    if(!D.enumerable){
	      if(!has(it, HIDDEN))dP(it, HIDDEN, createDesc(1, {}));
	      it[HIDDEN][key] = true;
	    } else {
	      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
	      D = _create(D, {enumerable: createDesc(0, false)});
	    } return setSymbolDesc(it, key, D);
	  } return dP(it, key, D);
	};
	var $defineProperties = function defineProperties(it, P){
	  anObject(it);
	  var keys = enumKeys(P = toIObject(P))
	    , i    = 0
	    , l = keys.length
	    , key;
	  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
	  return it;
	};
	var $create = function create(it, P){
	  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
	};
	var $propertyIsEnumerable = function propertyIsEnumerable(key){
	  var E = isEnum.call(this, key = toPrimitive(key, true));
	  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
	};
	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
	  var D = gOPD(it = toIObject(it), key = toPrimitive(key, true));
	  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
	  return D;
	};
	var $getOwnPropertyNames = function getOwnPropertyNames(it){
	  var names  = gOPN(toIObject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i)if(!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META)result.push(key);
	  return result;
	};
	var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
	  var names  = gOPN(toIObject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i)if(has(AllSymbols, key = names[i++]))result.push(AllSymbols[key]);
	  return result;
	};
	var $stringify = function stringify(it){
	  if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
	  var args = [it]
	    , i    = 1
	    , replacer, $replacer;
	  while(arguments.length > i)args.push(arguments[i++]);
	  replacer = args[1];
	  if(typeof replacer == 'function')$replacer = replacer;
	  if($replacer || !isArray(replacer))replacer = function(key, value){
	    if($replacer)value = $replacer.call(this, key, value);
	    if(!isSymbol(value))return value;
	  };
	  args[1] = replacer;
	  return _stringify.apply($JSON, args);
	};
	var BUGGY_JSON = $fails(function(){
	  var S = $Symbol();
	  // MS Edge converts symbol values to JSON as {}
	  // WebKit converts symbol values to JSON as null
	  // V8 throws on boxed symbols
	  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
	});

	// 19.4.1.1 Symbol([description])
	if(!USE_NATIVE){
	  $Symbol = function Symbol(){
	    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor!');
	    return wrap(uid(arguments.length > 0 ? arguments[0] : undefined));
	  };
	  redefine($Symbol[PROTOTYPE], 'toString', function toString(){
	    return this._k;
	  });

	  $GOPD.f = $getOwnPropertyDescriptor;
	  $DP.f   = $defineProperty;
	  __webpack_require__(73).f = gOPNExt.f = $getOwnPropertyNames;
	  __webpack_require__(70).f  = $propertyIsEnumerable
	  __webpack_require__(69).f = $getOwnPropertySymbols;

	  if(DESCRIPTORS && !__webpack_require__(14)){
	    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
	  }
	}

	$export($export.G + $export.W + $export.F * !USE_NATIVE, {Symbol: $Symbol});

	// 19.4.2.2 Symbol.hasInstance
	// 19.4.2.3 Symbol.isConcatSpreadable
	// 19.4.2.4 Symbol.iterator
	// 19.4.2.6 Symbol.match
	// 19.4.2.8 Symbol.replace
	// 19.4.2.9 Symbol.search
	// 19.4.2.10 Symbol.species
	// 19.4.2.11 Symbol.split
	// 19.4.2.12 Symbol.toPrimitive
	// 19.4.2.13 Symbol.toStringTag
	// 19.4.2.14 Symbol.unscopables
	for(var symbols = (
	  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
	).split(','), i = 0; symbols.length > i; ){
	  var key     = symbols[i++]
	    , Wrapper = core.Symbol
	    , sym     = wks(key);
	  if(!(key in Wrapper))dP(Wrapper, key, {value: USE_NATIVE ? sym : wrap(sym)});
	};

	// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
	if(!QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild)setter = true;

	$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
	  // 19.4.2.1 Symbol.for(key)
	  'for': function(key){
	    return has(SymbolRegistry, key += '')
	      ? SymbolRegistry[key]
	      : SymbolRegistry[key] = $Symbol(key);
	  },
	  // 19.4.2.5 Symbol.keyFor(sym)
	  keyFor: function keyFor(key){
	    if(isSymbol(key))return keyOf(SymbolRegistry, key);
	    throw TypeError(key + ' is not a symbol!');
	  },
	  useSetter: function(){ setter = true; },
	  useSimple: function(){ setter = false; }
	});

	$export($export.S + $export.F * !USE_NATIVE, 'Object', {
	  // 19.1.2.2 Object.create(O [, Properties])
	  create: $create,
	  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
	  defineProperty: $defineProperty,
	  // 19.1.2.3 Object.defineProperties(O, Properties)
	  defineProperties: $defineProperties,
	  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
	  // 19.1.2.7 Object.getOwnPropertyNames(O)
	  getOwnPropertyNames: $getOwnPropertyNames,
	  // 19.1.2.8 Object.getOwnPropertySymbols(O)
	  getOwnPropertySymbols: $getOwnPropertySymbols
	});

	// 24.3.2 JSON.stringify(value [, replacer [, space]])
	$JSON && $export($export.S + $export.F * (!USE_NATIVE || BUGGY_JSON), 'JSON', {stringify: $stringify});

	// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
	$Symbol[PROTOTYPE][TO_PRIMITIVE] || __webpack_require__(20)($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
	// 19.4.3.5 Symbol.prototype[@@toStringTag]
	setToStringTag($Symbol, 'Symbol');
	// 20.2.1.9 Math[@@toStringTag]
	setToStringTag(Math, 'Math', true);
	// 24.3.3 JSON[@@toStringTag]
	setToStringTag(global.JSON, 'JSON', true);

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	var META     = __webpack_require__(43)('meta')
	  , isObject = __webpack_require__(23)
	  , has      = __webpack_require__(31)
	  , setDesc  = __webpack_require__(21).f
	  , id       = 0;
	var isExtensible = Object.isExtensible || function(){
	  return true;
	};
	var FREEZE = !__webpack_require__(26)(function(){
	  return isExtensible(Object.preventExtensions({}));
	});
	var setMeta = function(it){
	  setDesc(it, META, {value: {
	    i: 'O' + ++id, // object ID
	    w: {}          // weak collections IDs
	  }});
	};
	var fastKey = function(it, create){
	  // return primitive with prefix
	  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
	  if(!has(it, META)){
	    // can't set metadata to uncaught frozen object
	    if(!isExtensible(it))return 'F';
	    // not necessary to add metadata
	    if(!create)return 'E';
	    // add missing metadata
	    setMeta(it);
	  // return object ID
	  } return it[META].i;
	};
	var getWeak = function(it, create){
	  if(!has(it, META)){
	    // can't set metadata to uncaught frozen object
	    if(!isExtensible(it))return true;
	    // not necessary to add metadata
	    if(!create)return false;
	    // add missing metadata
	    setMeta(it);
	  // return hash weak collections IDs
	  } return it[META].w;
	};
	// add metadata on freeze-family methods calling
	var onFreeze = function(it){
	  if(FREEZE && meta.NEED && isExtensible(it) && !has(it, META))setMeta(it);
	  return it;
	};
	var meta = module.exports = {
	  KEY:      META,
	  NEED:     false,
	  fastKey:  fastKey,
	  getWeak:  getWeak,
	  onFreeze: onFreeze
	};

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	var getKeys   = __webpack_require__(35)
	  , toIObject = __webpack_require__(9);
	module.exports = function(object, el){
	  var O      = toIObject(object)
	    , keys   = getKeys(O)
	    , length = keys.length
	    , index  = 0
	    , key;
	  while(length > index)if(O[key = keys[index++]] === el)return key;
	};

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	// all enumerable object keys, includes symbols
	var getKeys = __webpack_require__(35)
	  , gOPS    = __webpack_require__(69)
	  , pIE     = __webpack_require__(70);
	module.exports = function(it){
	  var result     = getKeys(it)
	    , getSymbols = gOPS.f;
	  if(getSymbols){
	    var symbols = getSymbols(it)
	      , isEnum  = pIE.f
	      , i       = 0
	      , key;
	    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))result.push(key);
	  } return result;
	};

/***/ },
/* 69 */
/***/ function(module, exports) {

	exports.f = Object.getOwnPropertySymbols;

/***/ },
/* 70 */
/***/ function(module, exports) {

	exports.f = {}.propertyIsEnumerable;

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	// 7.2.2 IsArray(argument)
	var cof = __webpack_require__(11);
	module.exports = Array.isArray || function isArray(arg){
	  return cof(arg) == 'Array';
	};

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	var toIObject = __webpack_require__(9)
	  , gOPN      = __webpack_require__(73).f
	  , toString  = {}.toString;

	var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];

	var getWindowNames = function(it){
	  try {
	    return gOPN(it);
	  } catch(e){
	    return windowNames.slice();
	  }
	};

	module.exports.f = function getOwnPropertyNames(it){
	  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
	};


/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
	var $keys      = __webpack_require__(36)
	  , hiddenKeys = __webpack_require__(44).concat('length', 'prototype');

	exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O){
	  return $keys(O, hiddenKeys);
	};

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	var pIE            = __webpack_require__(70)
	  , createDesc     = __webpack_require__(29)
	  , toIObject      = __webpack_require__(9)
	  , toPrimitive    = __webpack_require__(28)
	  , has            = __webpack_require__(31)
	  , IE8_DOM_DEFINE = __webpack_require__(24)
	  , gOPD           = Object.getOwnPropertyDescriptor;

	exports.f = __webpack_require__(25) ? gOPD : function getOwnPropertyDescriptor(O, P){
	  O = toIObject(O);
	  P = toPrimitive(P, true);
	  if(IE8_DOM_DEFINE)try {
	    return gOPD(O, P);
	  } catch(e){ /* empty */ }
	  if(has(O, P))return createDesc(!pIE.f.call(O, P), O[P]);
	};

/***/ },
/* 75 */
/***/ function(module, exports) {

	

/***/ },
/* 76 */
/***/ function(module, exports) {

	"use strict";

	exports.__esModule = true;

	exports.default = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _defineProperty = __webpack_require__(78);

	var _defineProperty2 = _interopRequireDefault(_defineProperty);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
	    }
	  }

	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	}();

/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(79), __esModule: true };

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(80);
	var $Object = __webpack_require__(17).Object;
	module.exports = function defineProperty(it, key, desc){
	  return $Object.defineProperty(it, key, desc);
	};

/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	var $export = __webpack_require__(15);
	// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
	$export($export.S + $export.F * !__webpack_require__(25), 'Object', {defineProperty: __webpack_require__(21).f});

/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _from = __webpack_require__(82);

	var _from2 = _interopRequireDefault(_from);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function (arr) {
	  if (Array.isArray(arr)) {
	    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
	      arr2[i] = arr[i];
	    }

	    return arr2;
	  } else {
	    return (0, _from2.default)(arr);
	  }
	};

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(83), __esModule: true };

/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(50);
	__webpack_require__(84);
	module.exports = __webpack_require__(17).Array.from;

/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var ctx         = __webpack_require__(18)
	  , $export     = __webpack_require__(15)
	  , toObject    = __webpack_require__(49)
	  , call        = __webpack_require__(85)
	  , isArrayIter = __webpack_require__(86)
	  , toLength    = __webpack_require__(38)
	  , getIterFn   = __webpack_require__(57);
	$export($export.S + $export.F * !__webpack_require__(87)(function(iter){ Array.from(iter); }), 'Array', {
	  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
	  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
	    var O       = toObject(arrayLike)
	      , C       = typeof this == 'function' ? this : Array
	      , aLen    = arguments.length
	      , mapfn   = aLen > 1 ? arguments[1] : undefined
	      , mapping = mapfn !== undefined
	      , index   = 0
	      , iterFn  = getIterFn(O)
	      , length, result, step, iterator;
	    if(mapping)mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
	    // if object isn't iterable or it's array with default iterator - use simple case
	    if(iterFn != undefined && !(C == Array && isArrayIter(iterFn))){
	      for(iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++){
	        result[index] = mapping ? call(iterator, mapfn, [step.value, index], true) : step.value;
	      }
	    } else {
	      length = toLength(O.length);
	      for(result = new C(length); length > index; index++){
	        result[index] = mapping ? mapfn(O[index], index) : O[index];
	      }
	    }
	    result.length = index;
	    return result;
	  }
	});


/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	// call something on iterator step with safe closing on error
	var anObject = __webpack_require__(22);
	module.exports = function(iterator, fn, value, entries){
	  try {
	    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
	  // 7.4.6 IteratorClose(iterator, completion)
	  } catch(e){
	    var ret = iterator['return'];
	    if(ret !== undefined)anObject(ret.call(iterator));
	    throw e;
	  }
	};

/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	// check on default Array iterator
	var Iterators  = __webpack_require__(8)
	  , ITERATOR   = __webpack_require__(47)('iterator')
	  , ArrayProto = Array.prototype;

	module.exports = function(it){
	  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
	};

/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	var ITERATOR     = __webpack_require__(47)('iterator')
	  , SAFE_CLOSING = false;

	try {
	  var riter = [7][ITERATOR]();
	  riter['return'] = function(){ SAFE_CLOSING = true; };
	  Array.from(riter, function(){ throw 2; });
	} catch(e){ /* empty */ }

	module.exports = function(exec, skipClosing){
	  if(!skipClosing && !SAFE_CLOSING)return false;
	  var safe = false;
	  try {
	    var arr  = [7]
	      , iter = arr[ITERATOR]();
	    iter.next = function(){ safe = true; };
	    arr[ITERATOR] = function(){ return iter; };
	    exec(arr);
	  } catch(e){ /* empty */ }
	  return safe;
	};

/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {// This method of obtaining a reference to the global object needs to be
	// kept identical to the way it is obtained in runtime.js
	var g =
	  typeof global === "object" ? global :
	  typeof window === "object" ? window :
	  typeof self === "object" ? self : this;

	// Use `getOwnPropertyNames` because not all browsers support calling
	// `hasOwnProperty` on the global `self` object in a worker. See #183.
	var hadRuntime = g.regeneratorRuntime &&
	  Object.getOwnPropertyNames(g).indexOf("regeneratorRuntime") >= 0;

	// Save the old regeneratorRuntime in case it needs to be restored later.
	var oldRuntime = hadRuntime && g.regeneratorRuntime;

	// Force reevalutation of runtime.js.
	g.regeneratorRuntime = undefined;

	module.exports = __webpack_require__(89);

	if (hadRuntime) {
	  // Restore the original runtime.
	  g.regeneratorRuntime = oldRuntime;
	} else {
	  // Remove the global property added by runtime.js.
	  try {
	    delete g.regeneratorRuntime;
	  } catch(e) {
	    g.regeneratorRuntime = undefined;
	  }
	}

	module.exports = { "default": module.exports, __esModule: true };

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, module, process) {"use strict";

	var _promise = __webpack_require__(92);

	var _promise2 = _interopRequireDefault(_promise);

	var _setPrototypeOf = __webpack_require__(104);

	var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

	var _create = __webpack_require__(107);

	var _create2 = _interopRequireDefault(_create);

	var _typeof2 = __webpack_require__(60);

	var _typeof3 = _interopRequireDefault(_typeof2);

	var _iterator = __webpack_require__(61);

	var _iterator2 = _interopRequireDefault(_iterator);

	var _symbol = __webpack_require__(63);

	var _symbol2 = _interopRequireDefault(_symbol);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Copyright (c) 2014, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
	 * additional grant of patent rights can be found in the PATENTS file in
	 * the same directory.
	 */

	!function (global) {
	  "use strict";

	  var hasOwn = Object.prototype.hasOwnProperty;
	  var undefined; // More compressible than void 0.
	  var iteratorSymbol = typeof _symbol2.default === "function" && _iterator2.default || "@@iterator";

	  var inModule = ( false ? "undefined" : (0, _typeof3.default)(module)) === "object";
	  var runtime = global.regeneratorRuntime;
	  if (runtime) {
	    if (inModule) {
	      // If regeneratorRuntime is defined globally and we're in a module,
	      // make the exports object identical to regeneratorRuntime.
	      module.exports = runtime;
	    }
	    // Don't bother evaluating the rest of this file if the runtime was
	    // already defined globally.
	    return;
	  }

	  // Define the runtime globally (as expected by generated code) as either
	  // module.exports (if we're in a module) or a new, empty object.
	  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

	  function wrap(innerFn, outerFn, self, tryLocsList) {
	    // If outerFn provided, then outerFn.prototype instanceof Generator.
	    var generator = (0, _create2.default)((outerFn || Generator).prototype);
	    var context = new Context(tryLocsList || []);

	    // The ._invoke method unifies the implementations of the .next,
	    // .throw, and .return methods.
	    generator._invoke = makeInvokeMethod(innerFn, self, context);

	    return generator;
	  }
	  runtime.wrap = wrap;

	  // Try/catch helper to minimize deoptimizations. Returns a completion
	  // record like context.tryEntries[i].completion. This interface could
	  // have been (and was previously) designed to take a closure to be
	  // invoked without arguments, but in all the cases we care about we
	  // already have an existing method we want to call, so there's no need
	  // to create a new function object. We can even get away with assuming
	  // the method takes exactly one argument, since that happens to be true
	  // in every case, so we don't have to touch the arguments object. The
	  // only additional allocation required is the completion record, which
	  // has a stable shape and so hopefully should be cheap to allocate.
	  function tryCatch(fn, obj, arg) {
	    try {
	      return { type: "normal", arg: fn.call(obj, arg) };
	    } catch (err) {
	      return { type: "throw", arg: err };
	    }
	  }

	  var GenStateSuspendedStart = "suspendedStart";
	  var GenStateSuspendedYield = "suspendedYield";
	  var GenStateExecuting = "executing";
	  var GenStateCompleted = "completed";

	  // Returning this object from the innerFn has the same effect as
	  // breaking out of the dispatch switch statement.
	  var ContinueSentinel = {};

	  // Dummy constructor functions that we use as the .constructor and
	  // .constructor.prototype properties for functions that return Generator
	  // objects. For full spec compliance, you may wish to configure your
	  // minifier not to mangle the names of these two functions.
	  function Generator() {}
	  function GeneratorFunction() {}
	  function GeneratorFunctionPrototype() {}

	  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
	  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
	  GeneratorFunctionPrototype.constructor = GeneratorFunction;
	  GeneratorFunction.displayName = "GeneratorFunction";

	  // Helper for defining the .next, .throw, and .return methods of the
	  // Iterator interface in terms of a single ._invoke method.
	  function defineIteratorMethods(prototype) {
	    ["next", "throw", "return"].forEach(function (method) {
	      prototype[method] = function (arg) {
	        return this._invoke(method, arg);
	      };
	    });
	  }

	  runtime.isGeneratorFunction = function (genFun) {
	    var ctor = typeof genFun === "function" && genFun.constructor;
	    return ctor ? ctor === GeneratorFunction ||
	    // For the native GeneratorFunction constructor, the best we can
	    // do is to check its .name property.
	    (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
	  };

	  runtime.mark = function (genFun) {
	    if (_setPrototypeOf2.default) {
	      (0, _setPrototypeOf2.default)(genFun, GeneratorFunctionPrototype);
	    } else {
	      genFun.__proto__ = GeneratorFunctionPrototype;
	    }
	    genFun.prototype = (0, _create2.default)(Gp);
	    return genFun;
	  };

	  // Within the body of any async function, `await x` is transformed to
	  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
	  // `value instanceof AwaitArgument` to determine if the yielded value is
	  // meant to be awaited. Some may consider the name of this method too
	  // cutesy, but they are curmudgeons.
	  runtime.awrap = function (arg) {
	    return new AwaitArgument(arg);
	  };

	  function AwaitArgument(arg) {
	    this.arg = arg;
	  }

	  function AsyncIterator(generator) {
	    // This invoke function is written in a style that assumes some
	    // calling function (or Promise) will handle exceptions.
	    function invoke(method, arg) {
	      var result = generator[method](arg);
	      var value = result.value;
	      return value instanceof AwaitArgument ? _promise2.default.resolve(value.arg).then(invokeNext, invokeThrow) : _promise2.default.resolve(value).then(function (unwrapped) {
	        // When a yielded Promise is resolved, its final value becomes
	        // the .value of the Promise<{value,done}> result for the
	        // current iteration. If the Promise is rejected, however, the
	        // result for this iteration will be rejected with the same
	        // reason. Note that rejections of yielded Promises are not
	        // thrown back into the generator function, as is the case
	        // when an awaited Promise is rejected. This difference in
	        // behavior between yield and await is important, because it
	        // allows the consumer to decide what to do with the yielded
	        // rejection (swallow it and continue, manually .throw it back
	        // into the generator, abandon iteration, whatever). With
	        // await, by contrast, there is no opportunity to examine the
	        // rejection reason outside the generator function, so the
	        // only option is to throw it from the await expression, and
	        // let the generator function handle the exception.
	        result.value = unwrapped;
	        return result;
	      });
	    }

	    if ((typeof process === "undefined" ? "undefined" : (0, _typeof3.default)(process)) === "object" && process.domain) {
	      invoke = process.domain.bind(invoke);
	    }

	    var invokeNext = invoke.bind(generator, "next");
	    var invokeThrow = invoke.bind(generator, "throw");
	    var invokeReturn = invoke.bind(generator, "return");
	    var previousPromise;

	    function enqueue(method, arg) {
	      function callInvokeWithMethodAndArg() {
	        return invoke(method, arg);
	      }

	      return previousPromise =
	      // If enqueue has been called before, then we want to wait until
	      // all previous Promises have been resolved before calling invoke,
	      // so that results are always delivered in the correct order. If
	      // enqueue has not been called before, then it is important to
	      // call invoke immediately, without waiting on a callback to fire,
	      // so that the async generator function has the opportunity to do
	      // any necessary setup in a predictable way. This predictability
	      // is why the Promise constructor synchronously invokes its
	      // executor callback, and why async functions synchronously
	      // execute code before the first await. Since we implement simple
	      // async functions in terms of async generators, it is especially
	      // important to get this right, even though it requires care.
	      previousPromise ? previousPromise.then(callInvokeWithMethodAndArg,
	      // Avoid propagating failures to Promises returned by later
	      // invocations of the iterator.
	      callInvokeWithMethodAndArg) : new _promise2.default(function (resolve) {
	        resolve(callInvokeWithMethodAndArg());
	      });
	    }

	    // Define the unified helper method that is used to implement .next,
	    // .throw, and .return (see defineIteratorMethods).
	    this._invoke = enqueue;
	  }

	  defineIteratorMethods(AsyncIterator.prototype);

	  // Note that simple async functions are implemented on top of
	  // AsyncIterator objects; they just return a Promise for the value of
	  // the final result produced by the iterator.
	  runtime.async = function (innerFn, outerFn, self, tryLocsList) {
	    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList));

	    return runtime.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
	    : iter.next().then(function (result) {
	      return result.done ? result.value : iter.next();
	    });
	  };

	  function makeInvokeMethod(innerFn, self, context) {
	    var state = GenStateSuspendedStart;

	    return function invoke(method, arg) {
	      if (state === GenStateExecuting) {
	        throw new Error("Generator is already running");
	      }

	      if (state === GenStateCompleted) {
	        if (method === "throw") {
	          throw arg;
	        }

	        // Be forgiving, per 25.3.3.3.3 of the spec:
	        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
	        return doneResult();
	      }

	      while (true) {
	        var delegate = context.delegate;
	        if (delegate) {
	          if (method === "return" || method === "throw" && delegate.iterator[method] === undefined) {
	            // A return or throw (when the delegate iterator has no throw
	            // method) always terminates the yield* loop.
	            context.delegate = null;

	            // If the delegate iterator has a return method, give it a
	            // chance to clean up.
	            var returnMethod = delegate.iterator["return"];
	            if (returnMethod) {
	              var record = tryCatch(returnMethod, delegate.iterator, arg);
	              if (record.type === "throw") {
	                // If the return method threw an exception, let that
	                // exception prevail over the original return or throw.
	                method = "throw";
	                arg = record.arg;
	                continue;
	              }
	            }

	            if (method === "return") {
	              // Continue with the outer return, now that the delegate
	              // iterator has been terminated.
	              continue;
	            }
	          }

	          var record = tryCatch(delegate.iterator[method], delegate.iterator, arg);

	          if (record.type === "throw") {
	            context.delegate = null;

	            // Like returning generator.throw(uncaught), but without the
	            // overhead of an extra function call.
	            method = "throw";
	            arg = record.arg;
	            continue;
	          }

	          // Delegate generator ran and handled its own exceptions so
	          // regardless of what the method was, we continue as if it is
	          // "next" with an undefined arg.
	          method = "next";
	          arg = undefined;

	          var info = record.arg;
	          if (info.done) {
	            context[delegate.resultName] = info.value;
	            context.next = delegate.nextLoc;
	          } else {
	            state = GenStateSuspendedYield;
	            return info;
	          }

	          context.delegate = null;
	        }

	        if (method === "next") {
	          context._sent = arg;

	          if (state === GenStateSuspendedYield) {
	            context.sent = arg;
	          } else {
	            context.sent = undefined;
	          }
	        } else if (method === "throw") {
	          if (state === GenStateSuspendedStart) {
	            state = GenStateCompleted;
	            throw arg;
	          }

	          if (context.dispatchException(arg)) {
	            // If the dispatched exception was caught by a catch block,
	            // then let that catch block handle the exception normally.
	            method = "next";
	            arg = undefined;
	          }
	        } else if (method === "return") {
	          context.abrupt("return", arg);
	        }

	        state = GenStateExecuting;

	        var record = tryCatch(innerFn, self, context);
	        if (record.type === "normal") {
	          // If an exception is thrown from innerFn, we leave state ===
	          // GenStateExecuting and loop back for another invocation.
	          state = context.done ? GenStateCompleted : GenStateSuspendedYield;

	          var info = {
	            value: record.arg,
	            done: context.done
	          };

	          if (record.arg === ContinueSentinel) {
	            if (context.delegate && method === "next") {
	              // Deliberately forget the last sent value so that we don't
	              // accidentally pass it on to the delegate.
	              arg = undefined;
	            }
	          } else {
	            return info;
	          }
	        } else if (record.type === "throw") {
	          state = GenStateCompleted;
	          // Dispatch the exception by looping back around to the
	          // context.dispatchException(arg) call above.
	          method = "throw";
	          arg = record.arg;
	        }
	      }
	    };
	  }

	  // Define Generator.prototype.{next,throw,return} in terms of the
	  // unified ._invoke helper method.
	  defineIteratorMethods(Gp);

	  Gp[iteratorSymbol] = function () {
	    return this;
	  };

	  Gp.toString = function () {
	    return "[object Generator]";
	  };

	  function pushTryEntry(locs) {
	    var entry = { tryLoc: locs[0] };

	    if (1 in locs) {
	      entry.catchLoc = locs[1];
	    }

	    if (2 in locs) {
	      entry.finallyLoc = locs[2];
	      entry.afterLoc = locs[3];
	    }

	    this.tryEntries.push(entry);
	  }

	  function resetTryEntry(entry) {
	    var record = entry.completion || {};
	    record.type = "normal";
	    delete record.arg;
	    entry.completion = record;
	  }

	  function Context(tryLocsList) {
	    // The root entry object (effectively a try statement without a catch
	    // or a finally block) gives us a place to store values thrown from
	    // locations where there is no enclosing try statement.
	    this.tryEntries = [{ tryLoc: "root" }];
	    tryLocsList.forEach(pushTryEntry, this);
	    this.reset(true);
	  }

	  runtime.keys = function (object) {
	    var keys = [];
	    for (var key in object) {
	      keys.push(key);
	    }
	    keys.reverse();

	    // Rather than returning an object with a next method, we keep
	    // things simple and return the next function itself.
	    return function next() {
	      while (keys.length) {
	        var key = keys.pop();
	        if (key in object) {
	          next.value = key;
	          next.done = false;
	          return next;
	        }
	      }

	      // To avoid creating an additional object, we just hang the .value
	      // and .done properties off the next function object itself. This
	      // also ensures that the minifier will not anonymize the function.
	      next.done = true;
	      return next;
	    };
	  };

	  function values(iterable) {
	    if (iterable) {
	      var iteratorMethod = iterable[iteratorSymbol];
	      if (iteratorMethod) {
	        return iteratorMethod.call(iterable);
	      }

	      if (typeof iterable.next === "function") {
	        return iterable;
	      }

	      if (!isNaN(iterable.length)) {
	        var i = -1,
	            next = function next() {
	          while (++i < iterable.length) {
	            if (hasOwn.call(iterable, i)) {
	              next.value = iterable[i];
	              next.done = false;
	              return next;
	            }
	          }

	          next.value = undefined;
	          next.done = true;

	          return next;
	        };

	        return next.next = next;
	      }
	    }

	    // Return an iterator with no values.
	    return { next: doneResult };
	  }
	  runtime.values = values;

	  function doneResult() {
	    return { value: undefined, done: true };
	  }

	  Context.prototype = {
	    constructor: Context,

	    reset: function reset(skipTempReset) {
	      this.prev = 0;
	      this.next = 0;
	      this.sent = undefined;
	      this.done = false;
	      this.delegate = null;

	      this.tryEntries.forEach(resetTryEntry);

	      if (!skipTempReset) {
	        for (var name in this) {
	          // Not sure about the optimal order of these conditions:
	          if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
	            this[name] = undefined;
	          }
	        }
	      }
	    },

	    stop: function stop() {
	      this.done = true;

	      var rootEntry = this.tryEntries[0];
	      var rootRecord = rootEntry.completion;
	      if (rootRecord.type === "throw") {
	        throw rootRecord.arg;
	      }

	      return this.rval;
	    },

	    dispatchException: function dispatchException(exception) {
	      if (this.done) {
	        throw exception;
	      }

	      var context = this;
	      function handle(loc, caught) {
	        record.type = "throw";
	        record.arg = exception;
	        context.next = loc;
	        return !!caught;
	      }

	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        var record = entry.completion;

	        if (entry.tryLoc === "root") {
	          // Exception thrown outside of any try block that could handle
	          // it, so set the completion value of the entire function to
	          // throw the exception.
	          return handle("end");
	        }

	        if (entry.tryLoc <= this.prev) {
	          var hasCatch = hasOwn.call(entry, "catchLoc");
	          var hasFinally = hasOwn.call(entry, "finallyLoc");

	          if (hasCatch && hasFinally) {
	            if (this.prev < entry.catchLoc) {
	              return handle(entry.catchLoc, true);
	            } else if (this.prev < entry.finallyLoc) {
	              return handle(entry.finallyLoc);
	            }
	          } else if (hasCatch) {
	            if (this.prev < entry.catchLoc) {
	              return handle(entry.catchLoc, true);
	            }
	          } else if (hasFinally) {
	            if (this.prev < entry.finallyLoc) {
	              return handle(entry.finallyLoc);
	            }
	          } else {
	            throw new Error("try statement without catch or finally");
	          }
	        }
	      }
	    },

	    abrupt: function abrupt(type, arg) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
	          var finallyEntry = entry;
	          break;
	        }
	      }

	      if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
	        // Ignore the finally entry if control is not jumping to a
	        // location outside the try/catch block.
	        finallyEntry = null;
	      }

	      var record = finallyEntry ? finallyEntry.completion : {};
	      record.type = type;
	      record.arg = arg;

	      if (finallyEntry) {
	        this.next = finallyEntry.finallyLoc;
	      } else {
	        this.complete(record);
	      }

	      return ContinueSentinel;
	    },

	    complete: function complete(record, afterLoc) {
	      if (record.type === "throw") {
	        throw record.arg;
	      }

	      if (record.type === "break" || record.type === "continue") {
	        this.next = record.arg;
	      } else if (record.type === "return") {
	        this.rval = record.arg;
	        this.next = "end";
	      } else if (record.type === "normal" && afterLoc) {
	        this.next = afterLoc;
	      }
	    },

	    finish: function finish(finallyLoc) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.finallyLoc === finallyLoc) {
	          this.complete(entry.completion, entry.afterLoc);
	          resetTryEntry(entry);
	          return ContinueSentinel;
	        }
	      }
	    },

	    "catch": function _catch(tryLoc) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.tryLoc === tryLoc) {
	          var record = entry.completion;
	          if (record.type === "throw") {
	            var thrown = record.arg;
	            resetTryEntry(entry);
	          }
	          return thrown;
	        }
	      }

	      // The context.catch method must only be called with a location
	      // argument that corresponds to a known catch block.
	      throw new Error("illegal catch attempt");
	    },

	    delegateYield: function delegateYield(iterable, resultName, nextLoc) {
	      this.delegate = {
	        iterator: values(iterable),
	        resultName: resultName,
	        nextLoc: nextLoc
	      };

	      return ContinueSentinel;
	    }
	  };
	}(
	// Among the various tricks for obtaining a reference to the global
	// object, this seems to be the most reliable technique that does not
	// use indirect eval (which violates Content Security Policy).
	(typeof global === "undefined" ? "undefined" : (0, _typeof3.default)(global)) === "object" ? global : (typeof window === "undefined" ? "undefined" : (0, _typeof3.default)(window)) === "object" ? window : (typeof self === "undefined" ? "undefined" : (0, _typeof3.default)(self)) === "object" ? self : undefined);
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(90)(module), __webpack_require__(91)))

/***/ },
/* 90 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 91 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(93), __esModule: true };

/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(75);
	__webpack_require__(50);
	__webpack_require__(4);
	__webpack_require__(94);
	module.exports = __webpack_require__(17).Promise;

/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY            = __webpack_require__(14)
	  , global             = __webpack_require__(16)
	  , ctx                = __webpack_require__(18)
	  , classof            = __webpack_require__(53)
	  , $export            = __webpack_require__(15)
	  , isObject           = __webpack_require__(23)
	  , anObject           = __webpack_require__(22)
	  , aFunction          = __webpack_require__(19)
	  , anInstance         = __webpack_require__(95)
	  , forOf              = __webpack_require__(96)
	  , setProto           = __webpack_require__(97).set
	  , speciesConstructor = __webpack_require__(98)
	  , task               = __webpack_require__(99).set
	  , microtask          = __webpack_require__(101)
	  , PROMISE            = 'Promise'
	  , TypeError          = global.TypeError
	  , process            = global.process
	  , $Promise           = global[PROMISE]
	  , process            = global.process
	  , isNode             = classof(process) == 'process'
	  , empty              = function(){ /* empty */ }
	  , Internal, GenericPromiseCapability, Wrapper;

	var USE_NATIVE = !!function(){
	  try {
	    // correct subclassing with @@species support
	    var promise     = $Promise.resolve(1)
	      , FakePromise = (promise.constructor = {})[__webpack_require__(47)('species')] = function(exec){ exec(empty, empty); };
	    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
	    return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
	  } catch(e){ /* empty */ }
	}();

	// helpers
	var sameConstructor = function(a, b){
	  // with library wrapper special case
	  return a === b || a === $Promise && b === Wrapper;
	};
	var isThenable = function(it){
	  var then;
	  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
	};
	var newPromiseCapability = function(C){
	  return sameConstructor($Promise, C)
	    ? new PromiseCapability(C)
	    : new GenericPromiseCapability(C);
	};
	var PromiseCapability = GenericPromiseCapability = function(C){
	  var resolve, reject;
	  this.promise = new C(function($$resolve, $$reject){
	    if(resolve !== undefined || reject !== undefined)throw TypeError('Bad Promise constructor');
	    resolve = $$resolve;
	    reject  = $$reject;
	  });
	  this.resolve = aFunction(resolve);
	  this.reject  = aFunction(reject);
	};
	var perform = function(exec){
	  try {
	    exec();
	  } catch(e){
	    return {error: e};
	  }
	};
	var notify = function(promise, isReject){
	  if(promise._n)return;
	  promise._n = true;
	  var chain = promise._c;
	  microtask(function(){
	    var value = promise._v
	      , ok    = promise._s == 1
	      , i     = 0;
	    var run = function(reaction){
	      var handler = ok ? reaction.ok : reaction.fail
	        , resolve = reaction.resolve
	        , reject  = reaction.reject
	        , domain  = reaction.domain
	        , result, then;
	      try {
	        if(handler){
	          if(!ok){
	            if(promise._h == 2)onHandleUnhandled(promise);
	            promise._h = 1;
	          }
	          if(handler === true)result = value;
	          else {
	            if(domain)domain.enter();
	            result = handler(value);
	            if(domain)domain.exit();
	          }
	          if(result === reaction.promise){
	            reject(TypeError('Promise-chain cycle'));
	          } else if(then = isThenable(result)){
	            then.call(result, resolve, reject);
	          } else resolve(result);
	        } else reject(value);
	      } catch(e){
	        reject(e);
	      }
	    };
	    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
	    promise._c = [];
	    promise._n = false;
	    if(isReject && !promise._h)onUnhandled(promise);
	  });
	};
	var onUnhandled = function(promise){
	  task.call(global, function(){
	    var value = promise._v
	      , abrupt, handler, console;
	    if(isUnhandled(promise)){
	      abrupt = perform(function(){
	        if(isNode){
	          process.emit('unhandledRejection', value, promise);
	        } else if(handler = global.onunhandledrejection){
	          handler({promise: promise, reason: value});
	        } else if((console = global.console) && console.error){
	          console.error('Unhandled promise rejection', value);
	        }
	      });
	      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
	      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
	    } promise._a = undefined;
	    if(abrupt)throw abrupt.error;
	  });
	};
	var isUnhandled = function(promise){
	  if(promise._h == 1)return false;
	  var chain = promise._a || promise._c
	    , i     = 0
	    , reaction;
	  while(chain.length > i){
	    reaction = chain[i++];
	    if(reaction.fail || !isUnhandled(reaction.promise))return false;
	  } return true;
	};
	var onHandleUnhandled = function(promise){
	  task.call(global, function(){
	    var handler;
	    if(isNode){
	      process.emit('rejectionHandled', promise);
	    } else if(handler = global.onrejectionhandled){
	      handler({promise: promise, reason: promise._v});
	    }
	  });
	};
	var $reject = function(value){
	  var promise = this;
	  if(promise._d)return;
	  promise._d = true;
	  promise = promise._w || promise; // unwrap
	  promise._v = value;
	  promise._s = 2;
	  if(!promise._a)promise._a = promise._c.slice();
	  notify(promise, true);
	};
	var $resolve = function(value){
	  var promise = this
	    , then;
	  if(promise._d)return;
	  promise._d = true;
	  promise = promise._w || promise; // unwrap
	  try {
	    if(promise === value)throw TypeError("Promise can't be resolved itself");
	    if(then = isThenable(value)){
	      microtask(function(){
	        var wrapper = {_w: promise, _d: false}; // wrap
	        try {
	          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
	        } catch(e){
	          $reject.call(wrapper, e);
	        }
	      });
	    } else {
	      promise._v = value;
	      promise._s = 1;
	      notify(promise, false);
	    }
	  } catch(e){
	    $reject.call({_w: promise, _d: false}, e); // wrap
	  }
	};

	// constructor polyfill
	if(!USE_NATIVE){
	  // 25.4.3.1 Promise(executor)
	  $Promise = function Promise(executor){
	    anInstance(this, $Promise, PROMISE, '_h');
	    aFunction(executor);
	    Internal.call(this);
	    try {
	      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
	    } catch(err){
	      $reject.call(this, err);
	    }
	  };
	  Internal = function Promise(executor){
	    this._c = [];             // <- awaiting reactions
	    this._a = undefined;      // <- checked in isUnhandled reactions
	    this._s = 0;              // <- state
	    this._d = false;          // <- done
	    this._v = undefined;      // <- value
	    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
	    this._n = false;          // <- notify
	  };
	  Internal.prototype = __webpack_require__(102)($Promise.prototype, {
	    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
	    then: function then(onFulfilled, onRejected){
	      var reaction    = newPromiseCapability(speciesConstructor(this, $Promise));
	      reaction.ok     = typeof onFulfilled == 'function' ? onFulfilled : true;
	      reaction.fail   = typeof onRejected == 'function' && onRejected;
	      reaction.domain = isNode ? process.domain : undefined;
	      this._c.push(reaction);
	      if(this._a)this._a.push(reaction);
	      if(this._s)notify(this, false);
	      return reaction.promise;
	    },
	    // 25.4.5.1 Promise.prototype.catch(onRejected)
	    'catch': function(onRejected){
	      return this.then(undefined, onRejected);
	    }
	  });
	  PromiseCapability = function(){
	    var promise  = new Internal;
	    this.promise = promise;
	    this.resolve = ctx($resolve, promise, 1);
	    this.reject  = ctx($reject, promise, 1);
	  };
	}

	$export($export.G + $export.W + $export.F * !USE_NATIVE, {Promise: $Promise});
	__webpack_require__(46)($Promise, PROMISE);
	__webpack_require__(103)(PROMISE);
	Wrapper = __webpack_require__(17)[PROMISE];

	// statics
	$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
	  // 25.4.4.5 Promise.reject(r)
	  reject: function reject(r){
	    var capability = newPromiseCapability(this)
	      , $$reject   = capability.reject;
	    $$reject(r);
	    return capability.promise;
	  }
	});
	$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
	  // 25.4.4.6 Promise.resolve(x)
	  resolve: function resolve(x){
	    // instanceof instead of internal slot check because we should fix it without replacement native Promise core
	    if(x instanceof $Promise && sameConstructor(x.constructor, this))return x;
	    var capability = newPromiseCapability(this)
	      , $$resolve  = capability.resolve;
	    $$resolve(x);
	    return capability.promise;
	  }
	});
	$export($export.S + $export.F * !(USE_NATIVE && __webpack_require__(87)(function(iter){
	  $Promise.all(iter)['catch'](empty);
	})), PROMISE, {
	  // 25.4.4.1 Promise.all(iterable)
	  all: function all(iterable){
	    var C          = this
	      , capability = newPromiseCapability(C)
	      , resolve    = capability.resolve
	      , reject     = capability.reject;
	    var abrupt = perform(function(){
	      var values    = []
	        , index     = 0
	        , remaining = 1;
	      forOf(iterable, false, function(promise){
	        var $index        = index++
	          , alreadyCalled = false;
	        values.push(undefined);
	        remaining++;
	        C.resolve(promise).then(function(value){
	          if(alreadyCalled)return;
	          alreadyCalled  = true;
	          values[$index] = value;
	          --remaining || resolve(values);
	        }, reject);
	      });
	      --remaining || resolve(values);
	    });
	    if(abrupt)reject(abrupt.error);
	    return capability.promise;
	  },
	  // 25.4.4.4 Promise.race(iterable)
	  race: function race(iterable){
	    var C          = this
	      , capability = newPromiseCapability(C)
	      , reject     = capability.reject;
	    var abrupt = perform(function(){
	      forOf(iterable, false, function(promise){
	        C.resolve(promise).then(capability.resolve, reject);
	      });
	    });
	    if(abrupt)reject(abrupt.error);
	    return capability.promise;
	  }
	});

/***/ },
/* 95 */
/***/ function(module, exports) {

	module.exports = function(it, Constructor, name, forbiddenField){
	  if(!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)){
	    throw TypeError(name + ': incorrect invocation!');
	  } return it;
	};

/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	var ctx         = __webpack_require__(18)
	  , call        = __webpack_require__(85)
	  , isArrayIter = __webpack_require__(86)
	  , anObject    = __webpack_require__(22)
	  , toLength    = __webpack_require__(38)
	  , getIterFn   = __webpack_require__(57);
	module.exports = function(iterable, entries, fn, that, ITERATOR){
	  var iterFn = ITERATOR ? function(){ return iterable; } : getIterFn(iterable)
	    , f      = ctx(fn, that, entries ? 2 : 1)
	    , index  = 0
	    , length, step, iterator;
	  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
	  // fast case for arrays with default iterator
	  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
	    entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
	  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
	    call(iterator, f, step.value, entries);
	  }
	};

/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	// Works with __proto__ only. Old v8 can't work with null proto objects.
	/* eslint-disable no-proto */
	var isObject = __webpack_require__(23)
	  , anObject = __webpack_require__(22);
	var check = function(O, proto){
	  anObject(O);
	  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
	};
	module.exports = {
	  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
	    function(test, buggy, set){
	      try {
	        set = __webpack_require__(18)(Function.call, __webpack_require__(74).f(Object.prototype, '__proto__').set, 2);
	        set(test, []);
	        buggy = !(test instanceof Array);
	      } catch(e){ buggy = true; }
	      return function setPrototypeOf(O, proto){
	        check(O, proto);
	        if(buggy)O.__proto__ = proto;
	        else set(O, proto);
	        return O;
	      };
	    }({}, false) : undefined),
	  check: check
	};

/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	// 7.3.20 SpeciesConstructor(O, defaultConstructor)
	var anObject  = __webpack_require__(22)
	  , aFunction = __webpack_require__(19)
	  , SPECIES   = __webpack_require__(47)('species');
	module.exports = function(O, D){
	  var C = anObject(O).constructor, S;
	  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
	};

/***/ },
/* 99 */
/***/ function(module, exports, __webpack_require__) {

	var ctx                = __webpack_require__(18)
	  , invoke             = __webpack_require__(100)
	  , html               = __webpack_require__(45)
	  , cel                = __webpack_require__(27)
	  , global             = __webpack_require__(16)
	  , process            = global.process
	  , setTask            = global.setImmediate
	  , clearTask          = global.clearImmediate
	  , MessageChannel     = global.MessageChannel
	  , counter            = 0
	  , queue              = {}
	  , ONREADYSTATECHANGE = 'onreadystatechange'
	  , defer, channel, port;
	var run = function(){
	  var id = +this;
	  if(queue.hasOwnProperty(id)){
	    var fn = queue[id];
	    delete queue[id];
	    fn();
	  }
	};
	var listener = function(event){
	  run.call(event.data);
	};
	// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
	if(!setTask || !clearTask){
	  setTask = function setImmediate(fn){
	    var args = [], i = 1;
	    while(arguments.length > i)args.push(arguments[i++]);
	    queue[++counter] = function(){
	      invoke(typeof fn == 'function' ? fn : Function(fn), args);
	    };
	    defer(counter);
	    return counter;
	  };
	  clearTask = function clearImmediate(id){
	    delete queue[id];
	  };
	  // Node.js 0.8-
	  if(__webpack_require__(11)(process) == 'process'){
	    defer = function(id){
	      process.nextTick(ctx(run, id, 1));
	    };
	  // Browsers with MessageChannel, includes WebWorkers
	  } else if(MessageChannel){
	    channel = new MessageChannel;
	    port    = channel.port2;
	    channel.port1.onmessage = listener;
	    defer = ctx(port.postMessage, port, 1);
	  // Browsers with postMessage, skip WebWorkers
	  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
	  } else if(global.addEventListener && typeof postMessage == 'function' && !global.importScripts){
	    defer = function(id){
	      global.postMessage(id + '', '*');
	    };
	    global.addEventListener('message', listener, false);
	  // IE8-
	  } else if(ONREADYSTATECHANGE in cel('script')){
	    defer = function(id){
	      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
	        html.removeChild(this);
	        run.call(id);
	      };
	    };
	  // Rest old browsers
	  } else {
	    defer = function(id){
	      setTimeout(ctx(run, id, 1), 0);
	    };
	  }
	}
	module.exports = {
	  set:   setTask,
	  clear: clearTask
	};

/***/ },
/* 100 */
/***/ function(module, exports) {

	// fast apply, http://jsperf.lnkit.com/fast-apply/5
	module.exports = function(fn, args, that){
	  var un = that === undefined;
	  switch(args.length){
	    case 0: return un ? fn()
	                      : fn.call(that);
	    case 1: return un ? fn(args[0])
	                      : fn.call(that, args[0]);
	    case 2: return un ? fn(args[0], args[1])
	                      : fn.call(that, args[0], args[1]);
	    case 3: return un ? fn(args[0], args[1], args[2])
	                      : fn.call(that, args[0], args[1], args[2]);
	    case 4: return un ? fn(args[0], args[1], args[2], args[3])
	                      : fn.call(that, args[0], args[1], args[2], args[3]);
	  } return              fn.apply(that, args);
	};

/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(16)
	  , macrotask = __webpack_require__(99).set
	  , Observer  = global.MutationObserver || global.WebKitMutationObserver
	  , process   = global.process
	  , Promise   = global.Promise
	  , isNode    = __webpack_require__(11)(process) == 'process'
	  , head, last, notify;

	var flush = function(){
	  var parent, fn;
	  if(isNode && (parent = process.domain))parent.exit();
	  while(head){
	    fn = head.fn;
	    fn(); // <- currently we use it only for Promise - try / catch not required
	    head = head.next;
	  } last = undefined;
	  if(parent)parent.enter();
	};

	// Node.js
	if(isNode){
	  notify = function(){
	    process.nextTick(flush);
	  };
	// browsers with MutationObserver
	} else if(Observer){
	  var toggle = true
	    , node   = document.createTextNode('');
	  new Observer(flush).observe(node, {characterData: true}); // eslint-disable-line no-new
	  notify = function(){
	    node.data = toggle = !toggle;
	  };
	// environments with maybe non-completely correct, but existent Promise
	} else if(Promise && Promise.resolve){
	  notify = function(){
	    Promise.resolve().then(flush);
	  };
	// for other environments - macrotask based on:
	// - setImmediate
	// - MessageChannel
	// - window.postMessag
	// - onreadystatechange
	// - setTimeout
	} else {
	  notify = function(){
	    // strange IE + webpack dev server bug - use .call(global)
	    macrotask.call(global, flush);
	  };
	}

	module.exports = function(fn){
	  var task = {fn: fn, next: undefined};
	  if(last)last.next = task;
	  if(!head){
	    head = task;
	    notify();
	  } last = task;
	};

/***/ },
/* 102 */
/***/ function(module, exports, __webpack_require__) {

	var hide = __webpack_require__(20);
	module.exports = function(target, src, safe){
	  for(var key in src){
	    if(safe && target[key])target[key] = src[key];
	    else hide(target, key, src[key]);
	  } return target;
	};

/***/ },
/* 103 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var global      = __webpack_require__(16)
	  , core        = __webpack_require__(17)
	  , dP          = __webpack_require__(21)
	  , DESCRIPTORS = __webpack_require__(25)
	  , SPECIES     = __webpack_require__(47)('species');

	module.exports = function(KEY){
	  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
	  if(DESCRIPTORS && C && !C[SPECIES])dP.f(C, SPECIES, {
	    configurable: true,
	    get: function(){ return this; }
	  });
	};

/***/ },
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(105), __esModule: true };

/***/ },
/* 105 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(106);
	module.exports = __webpack_require__(17).Object.setPrototypeOf;

/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.19 Object.setPrototypeOf(O, proto)
	var $export = __webpack_require__(15);
	$export($export.S, 'Object', {setPrototypeOf: __webpack_require__(97).set});

/***/ },
/* 107 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(108), __esModule: true };

/***/ },
/* 108 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(109);
	var $Object = __webpack_require__(17).Object;
	module.exports = function create(P, D){
	  return $Object.create(P, D);
	};

/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	var $export = __webpack_require__(15)
	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	$export($export.S, 'Object', {create: __webpack_require__(33)});

/***/ },
/* 110 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _promise = __webpack_require__(92);

	var _promise2 = _interopRequireDefault(_promise);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function (fn) {
	  return function () {
	    var gen = fn.apply(this, arguments);
	    return new _promise2.default(function (resolve, reject) {
	      function step(key, arg) {
	        try {
	          var info = gen[key](arg);
	          var value = info.value;
	        } catch (error) {
	          reject(error);
	          return;
	        }

	        if (info.done) {
	          resolve(value);
	        } else {
	          return _promise2.default.resolve(value).then(function (value) {
	            return step("next", value);
	          }, function (err) {
	            return step("throw", err);
	          });
	        }
	      }

	      return step("next");
	    });
	  };
	};

/***/ },
/* 111 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.SlidingBuffer = exports.DroppingBuffer = exports.FixedQueue = exports.List = exports.Queue = exports.FixedStack = exports.Stack = undefined;

	var _get2 = __webpack_require__(112);

	var _get3 = _interopRequireDefault(_get2);

	var _getPrototypeOf = __webpack_require__(113);

	var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

	var _possibleConstructorReturn2 = __webpack_require__(120);

	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

	var _inherits2 = __webpack_require__(121);

	var _inherits3 = _interopRequireDefault(_inherits2);

	var _create = __webpack_require__(107);

	var _create2 = _interopRequireDefault(_create);

	var _toStringTag = __webpack_require__(122);

	var _toStringTag2 = _interopRequireDefault(_toStringTag);

	var _toConsumableArray2 = __webpack_require__(81);

	var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

	var _getIterator2 = __webpack_require__(54);

	var _getIterator3 = _interopRequireDefault(_getIterator2);

	var _iterator = __webpack_require__(61);

	var _iterator2 = _interopRequireDefault(_iterator);

	var _classCallCheck2 = __webpack_require__(76);

	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

	var _createClass2 = __webpack_require__(77);

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

/***/ },
/* 112 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _getPrototypeOf = __webpack_require__(113);

	var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

	var _getOwnPropertyDescriptor = __webpack_require__(117);

	var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function get(object, property, receiver) {
	  if (object === null) object = Function.prototype;
	  var desc = (0, _getOwnPropertyDescriptor2.default)(object, property);

	  if (desc === undefined) {
	    var parent = (0, _getPrototypeOf2.default)(object);

	    if (parent === null) {
	      return undefined;
	    } else {
	      return get(parent, property, receiver);
	    }
	  } else if ("value" in desc) {
	    return desc.value;
	  } else {
	    var getter = desc.get;

	    if (getter === undefined) {
	      return undefined;
	    }

	    return getter.call(receiver);
	  }
	};

/***/ },
/* 113 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(114), __esModule: true };

/***/ },
/* 114 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(115);
	module.exports = __webpack_require__(17).Object.getPrototypeOf;

/***/ },
/* 115 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.9 Object.getPrototypeOf(O)
	var toObject        = __webpack_require__(49)
	  , $getPrototypeOf = __webpack_require__(48);

	__webpack_require__(116)('getPrototypeOf', function(){
	  return function getPrototypeOf(it){
	    return $getPrototypeOf(toObject(it));
	  };
	});

/***/ },
/* 116 */
/***/ function(module, exports, __webpack_require__) {

	// most Object methods by ES6 should accept primitives
	var $export = __webpack_require__(15)
	  , core    = __webpack_require__(17)
	  , fails   = __webpack_require__(26);
	module.exports = function(KEY, exec){
	  var fn  = (core.Object || {})[KEY] || Object[KEY]
	    , exp = {};
	  exp[KEY] = exec(fn);
	  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
	};

/***/ },
/* 117 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(118), __esModule: true };

/***/ },
/* 118 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(119);
	var $Object = __webpack_require__(17).Object;
	module.exports = function getOwnPropertyDescriptor(it, key){
	  return $Object.getOwnPropertyDescriptor(it, key);
	};

/***/ },
/* 119 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	var toIObject                 = __webpack_require__(9)
	  , $getOwnPropertyDescriptor = __webpack_require__(74).f;

	__webpack_require__(116)('getOwnPropertyDescriptor', function(){
	  return function getOwnPropertyDescriptor(it, key){
	    return $getOwnPropertyDescriptor(toIObject(it), key);
	  };
	});

/***/ },
/* 120 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _typeof2 = __webpack_require__(60);

	var _typeof3 = _interopRequireDefault(_typeof2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function (self, call) {
	  if (!self) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return call && ((typeof call === "undefined" ? "undefined" : (0, _typeof3.default)(call)) === "object" || typeof call === "function") ? call : self;
	};

/***/ },
/* 121 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _setPrototypeOf = __webpack_require__(104);

	var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

	var _create = __webpack_require__(107);

	var _create2 = _interopRequireDefault(_create);

	var _typeof2 = __webpack_require__(60);

	var _typeof3 = _interopRequireDefault(_typeof2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function (subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : (0, _typeof3.default)(superClass)));
	  }

	  subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      enumerable: false,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
	};

/***/ },
/* 122 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(123), __esModule: true };

/***/ },
/* 123 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(75);
	module.exports = __webpack_require__(47)('toStringTag');

/***/ }
/******/ ])
});
;