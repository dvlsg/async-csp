"use strict";

import { List, FixedQueue } from './data-structures.js';
let log = ::console.log; // eslint-disable-line no-unused-vars

/*
    Three possible states:

    OPEN   : The Channel can be written to and taken from freely.
    CLOSED : The Channel can no longer be written to, but still has values to be taken.
    ENDED  : The Channel is closed, and no longer has values to be taken.
*/
export const STATES = {
      OPEN   : Symbol('channel_open')
    , CLOSED : Symbol('channel_closed')
    , ENDED  : Symbol('channel_ended')
};

export const ACTIONS = {
    // channel has just been closed, and has no more values to take
    DONE   : Symbol('channel_done'),
    CANCEL : Symbol('channel_cancel')
};

const SLIDER = Symbol('channel_slider');
const STATE = Symbol('channel_state');
const SHOULD_CLOSE = Symbol('channel_should_close');
const IS_CONSUMING = Symbol('channel_consuming');
const IS_FLUSHING = Symbol('channel_flushing');
const IS_SLIDING = Symbol('channel_sliding');

/*
    Error expose method to assist with ensuring
    that error messages are properly thrown instead of swallowed.

    setTimeout is used to ensure that the error is thrown
    from a location that will not be eaten by an async throw.
*/
function expose(e: Error) {
    setTimeout(() => {
        throw e;
    });
}

/*
    Marks a channel as ended, and signals any promises
    which are waiting for the end of the channel.
*/
function finish(ch: Channel) {
    ch[STATE] = STATES.ENDED;
    let waiting = null;
    while (waiting = ch.waiting.shift()) // eslint-disable-line no-cond-assign
        waiting();
}

/*
    Flushes out any remaining takes from the channel
    by sending them the value of `ACTIONS.DONE`.
*/
async function flush(ch: Channel) {
    if (!ch.empty())
        // this error is never expected to be thrown
        // just a sanity check during development
        throw new Error('Attempted to execute flush(Channel) on a non-empty channel!');
    if (ch[IS_FLUSHING])
        return;
    ch[IS_FLUSHING] = true;
    let take = null,
        takes = [];
    while (take = ch.takes.shift()) // eslint-disable-line no-cond-assign
        takes.push(take(ACTIONS.DONE));
    await Promise.all(takes);
    if (!ch[IS_CONSUMING])
        finish(ch);
    ch[IS_FLUSHING] = false;
}

function wrap(val: any, transform: Function, resolve: Function) {
    let wrapped = null;
    if (transform instanceof Function) {
        if (transform.length === 1) {
            wrapped = async() => {
                let transformed = transform(val);
                if (transformed instanceof Promise) {
                    let actual = await transformed;
                    return actual;
                }
                return transformed;
            };
        }
        else {
            let accepted = new List();
            if (transform.length === 2) {
                wrapped = async() => {
                    await transform(val, acc => {
                        if (typeof acc !== 'undefined')
                            accepted.push(acc);
                    });
                    return accepted;
                };
            }
            else /* transform.length === 3 */ {
                wrapped = () => {
                    return new Promise(res => {
                        transform(val, acc => {
                            if (typeof acc !== 'undefined')
                                accepted.push(acc);
                        }, () => {
                            res(accepted);
                        });
                    });
                };
            }
        }
    }
    else {
        wrapped = async() => val;
    }
    return {
        wrapped,
        resolve,
        transform,
        val
    };
}

async function _bufferedSlide(ch: Channel) {
    while (!ch.buf.empty() && !ch.takes.empty()) {
        let buf = ch.buf.shift();
        let val = null;
        if (buf && buf.wrapped)
            val = await buf.wrapped();
        else
            val = buf; // this is a special case caused by `from`. can we get rid of the need for this?
        if (typeof val !== 'undefined') {
            if (val instanceof List) { // need a way to distinguish this as a "special" array return
                let accepted = [ ...val ];
                if (accepted.length === 0)
                    buf.resolve();
                else if (accepted.length === 1) {
                    buf.resolve();
                    let take = ch.takes.shift();
                    take(accepted[0]);
                }
                else /* accepted.length > 1 */ {
                    let count = 0;
                    let counter = () => {
                        count++;
                        if (count === accepted.length)
                            buf.resolve();
                    };
                    let wrappers = accepted.map(acc => wrap(acc, x => x, counter));
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

                    ch.buf.unshift(...wrappers); // this can expand beyond the actual buffer size. unintuitive?
                }
            }
            else {
                let take = ch.takes.shift();
                take(val);
            }
        }
        if (!ch.puts.empty() && !ch.buf.full()) {
            let put = ch.puts.shift();
            ch.buf.push(put);
            put.resolve();
        }
    }
    while (!ch.puts.empty() && !ch.buf.full()) {
        let put = ch.puts.shift();
        ch.buf.push(put);
        put.resolve();
    }
}

async function _slide(ch: Channel) {
    while (!ch.takes.empty() && !ch.puts.empty()) {
        let put = ch.puts.shift();
        let val = await put.wrapped();
        if (typeof val !== 'undefined') {
            if (val instanceof List) { // need a way to distinguish this as a "special" array return
                let accepted = [ ...val ];
                if (accepted.length === 0)
                    put.resolve();
                else if (accepted.length === 1) {
                    put.resolve();
                    let take = ch.takes.shift();
                    take(accepted[0]);
                }
                else /* val.length > 1 */ {
                    let count = 0;
                    let counter = () => {
                        count++;
                        if (count === accepted.length)
                            put.resolve();
                    };
                    let wrappers = accepted.map(acc => wrap(acc, x => x, counter));
                    ch.puts.unshift(...wrappers);
                }
            }
            else {
                put.resolve();
                let take = ch.takes.shift();
                take(val);
            }
        }
        else {
            put.resolve();
        }
    }
}

function canSlide(ch: Channel) {
    return ch.buf
        ? !ch.buf.full() && !ch.puts.empty() || !ch.takes.empty() && !ch.buf.empty()
        : !ch.takes.empty() && !ch.puts.empty();
}

async function slide(ch: Channel) {
    if (ch[IS_SLIDING])
        return;
    ch[IS_SLIDING] = true;

    while (canSlide(ch))
        await ch[SLIDER](ch);

    if (ch[STATE] === STATES.CLOSED && !ch.tails.empty() && (ch.buf ? ch.buf.empty() : true) && ch.puts.empty()) {
        ch.puts.unshift(...ch.tails);
        ch.tails = new List(); // need a way to empty out the list
        while (canSlide(ch))
            await ch[SLIDER](ch);
    }

    if ((ch[STATE] === STATES.CLOSED || ch[STATE] === STATES.ENDED) && (ch.buf ? ch.buf.empty() : true) && ch.puts.empty() && ch.tails.empty())
        flush(ch);

    ch[IS_SLIDING] = false;
}

export function timeout(delay = 0) {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
}

export default class Channel {

    // A List containing any puts which could not be placed directly onto the buffer
    puts: List;

    // A List containing any takes waiting for values to be provided
    takes: List;

    // A FixedQueue containing values ready to be taken.
    buf: FixedQueue;

    // An optional function to used to transform values passing through the channel.
    transform: Function;

    // An optional pipeline of channels, to be used to pipe values
    // from one channel to multiple others.
    pipeline: Array<Channel>;

    // An optional array of promises, to be resolved when the channel is marked as finished.
    waiting: Array<Promise>;

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
    constructor(... argv) {
        let size = null;
        let transform = null;
        if (typeof argv[0] === 'function')
            transform = argv[0];
        if (typeof argv[0] === 'number') {
            size = argv[0];
            if (argv[1] && typeof argv[1] === 'function')
                transform = argv[1];
        }
        this.puts      = new List();
        this.tails     = new List();
        this.takes     = new List();
        this.transform = transform;
        this.pipeline  = [];
        this.waiting   = [];
        this[STATE]    = STATES.OPEN;

        if (size) {
            this.buf = new FixedQueue(size);
            this[SLIDER] = _bufferedSlide;
        }
        else
            this[SLIDER] = _slide;
    }

    /*
        A helper constructor which will convert any iterable into a channel,
        placing all of the iterable's values onto that channel.
    */
    static from(iterable, keepOpen = false) {
        let arr = [ ...iterable ];
        let ch = new Channel(arr.length);
        for (let val of arr)
            ch.buf.push(val);
        if (!keepOpen)
            ch.close(true);
        return ch;
    }

    /*
        Sets the state of the channel.
    */
    set state(val) {
        this[STATE] = val;
    }

    /*
        Gets the state of the channel.
    */
    get state() {
        return this[STATE];
    }

    /*
        Gets the length of the channel,
        which is interpreted as the current length of the buffer
        added to any puts which are waiting for space in the buffer.
    */
    get length() {
        if (this.buf)
            return this.buf.length + this.puts.length;
        return this.puts.length;
    }

    /*
        Gets the size of the channel,
        which is interpreted as the size of the buffer.
    */
    get size() {
        return this.buf ? this.buf.size : undefined;
    }

    /*
        Marks a channel to no longer be writable.

        Accepts an optional boolean `all`, to signify
        whether or not to close the entire pipeline.
    */
    static close(ch: Channel, all: Boolean = false) {
        ch.state = STATES.CLOSED;
        if (all)
            ch[SHOULD_CLOSE] = true;
        setTimeout(() => slide(ch)); // we have a timing problem with pipes.. this resolves it, but is hacky.
    }

    /*
        Calls Channel.close for `this`, `all`.
    */
    close(all: Boolean = false) {
        return Channel.close(this, all);
    }

    /*
        Determines if a channel
        has any values left for `take` to use.
    */
    static empty(ch: Channel) {
        if (ch.buf)
            return ch.buf.empty() && ch.puts.empty();
        return ch.puts.empty();
    }

    /*
        Returns Channel.empty for `this`.
    */
    empty() {
        return Channel.empty(this);
    }

    /*
        Places a new value onto the provided channel.

        If the buffer is full, the promise will be pushed
        onto Channel.puts to be resolved when buffer space is available.
    */
    static put(ch: Channel, val: any) {
        return new Promise((resolve) => {
            if (ch.state !== STATES.OPEN)
                return resolve(ACTIONS.DONE);
            let put = wrap(val, ch.transform, resolve);
            ch.puts.push(put);
            slide(ch);
        });
    }

    /*
        Returns Channel.put for `this`, `val`.
    */
    put(val: any) {
        return Channel.put(this, val);
    }

    /*
        Takes the first value from the provided channel.

        If no value is provided, the promise will be pushed
        onto Channel.takes to be resolved when a value is available.
    */
    static take(ch: Channel) {
        return new Promise((resolve) => {
            if (ch.state === STATES.ENDED)
                return resolve(ACTIONS.DONE);
            ch.takes.push(resolve);
            slide(ch);
        });
    }

    /*
        Returns Channel.take for `this`.
    */
    take() {
        return Channel.take(this);
    }

    static tail(ch: Channel, val: any) {
        return new Promise((resolve) => {
            if (ch.state !== STATES.OPEN)
                return resolve(ACTIONS.DONE);
            let tail = wrap(val, ch.transform, resolve);
            ch.tails.push(tail);
            slide(ch);
        });
    }

    /*
        Returns Channel.tail for `this`.
    */
    tail(val: any) {
        return Channel.tail(this, val);
    }

    /*
        Helper method for putting values onto a channel
        from a provided producer whenever there is space.
    */
    static async produce(
          ch       : Channel
        , producer : Function
    ): Function {
        let spin = true;
        (async() => {
            try {
                while (spin) {
                    let val = producer();
                    if (val instanceof Promise)
                        val = await val;
                    else
                        await timeout();
                    let r = await Channel.put(ch, val);
                    if (r === ACTIONS.DONE)
                        break;
                }
            }
            catch(e) {
                expose(e);
            }
        })();
        return () => {
            spin = false;
        };
    }

    /*
        Calls Channel.produce for `this`, `producer`.
    */
    produce(producer: Function) {
        return Channel.produce(this, producer);
    }

    /*
        Helper method for executing a provided consumer
        each time a channel value is available.
    */
    static async consume(
          ch       : Channel
        , consumer : Function = () => {} // noop default
    ): Function {
        ch[IS_CONSUMING] = true;
        (async() => {
            let taking = Channel.take(ch);
            while (ch[IS_CONSUMING]) {
                let val = await taking;
                if (val === ACTIONS.DONE)
                    break;
                let consuming = consumer(val);
                taking = Channel.take(ch);
                await consuming;
            }
            ch[IS_CONSUMING] = false;
            if (ch[IS_FLUSHING])
                await ch[IS_FLUSHING];
            else
                finish(ch);
        })();
    }

    /*
        Calls Channel.consume for `this`, `consumer`.
    */
    consume(consumer: Function = () => {}) {
        return Channel.consume(this, consumer);
    }

    /*
        Registers a promise to be resolved
        when the channel has fully ended.
    */
    static done(ch: Channel) {
        return new Promise((resolve) => {
            if (ch.state === STATES.ENDED)
                return resolve();
            ch.waiting.push(resolve);
        });
    }

    /*
        Returns Channel.done for `this`.
    */
    done() {
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
    static pipeline(...args) {
        let first = null;
        let last = null;
        if (args.length === 0) {
            first = new Channel();
            last = first;
        }
        else {
            if (Array.isArray(args[0]))
                args = [ ...args[0] ];
            let channels = args
                .filter(x => x instanceof Function)
                .map(fn => new Channel(fn));
            first = channels[0];
            last = channels.reduce((x, y) => x.pipe(y));
        }
        return [ first, last ];
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
    static pipe(parent: Channel, ...channels: Array<Channel>) {
        parent.pipeline.push(...channels);
        if (!parent[ACTIONS.CANCEL]) {
            let running = true;
            (async() => {
                while (running) {
                    let val = await parent.take();
                    if (val === ACTIONS.DONE) {
                        if (parent[SHOULD_CLOSE]) {
                            for (let channel of parent.pipeline)
                                channel.close(true);
                        }
                        break;
                    }
                    await Promise.all(parent.pipeline.map(x => x.put(val))); // eslint-disable-line no-loop-func
                }
            })();
            parent[ACTIONS.CANCEL] = () => {
                running = false;
            };
        }
        return channels[channels.length - 1];
    }

    /*
        Returns Channel.pipe for `this`, `...channels`.
    */
    pipe(...channels: Array<Channel>) {
        return Channel.pipe(this, ...channels);
    }

    /*
        Pipes all provided channels into a new, single destination.
    */
    static merge(...channels: Array<Channel>) {
        let child = new Channel();
        for (let parent of channels)
            parent.pipe(child);
        return child;
    }

    /*
        Returns Channel.merge for `this`, `...channels`.
    */
    merge(...channels: Array<Channel>) {
        return Channel.merge(this, ...channels);
    }

    static unpipe(parent: Channel, ...channels: Array<Channel>) {
        for (let [ index, pipe ] of Array.entries(parent.pipeline)) {
            for (let ch2 of channels) {
                if (pipe === ch2)
                    parent.pipeline.splice(index, 1);
            }
        }
        if (parent.pipeline.length === 0 && parent[ACTIONS.CANCEL])
            parent[ACTIONS.CANCEL](); // don't spin the automatic pipe method when no pipeline is attached
        return parent;
    }

    unpipe(...channels: Array<Channel>) {
        return Channel.unpipe(this, ...channels);
    }
}

Channel.DONE = ACTIONS.DONE; // expose this so loops can listen for it
