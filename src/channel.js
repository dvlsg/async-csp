"use strict";

/* eslint no-cond-assign: 0 */  // intentional while loop assign in flush
/* eslint no-unused-vars: 0 */  // so we can have log, even when not using it
/* eslint no-empty: 0 */        // intentional empty block inside Channel.produce()

import { Queue, FixedQueue } from './data-structures.js';
let log = console.log.bind(console);

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

const SHOULD_CLOSE = Symbol('channel_should_close');
const CHANNEL_SOURCE = Symbol('channel_source');
const IS_PIPED = Symbol('channel_piped'); // TBD -- do we need this?

/*
    Error expose method to assist with ensuring
    that error messages are properly thrown instead of swallowed.

    setTimeout is used to ensure that the error is thrown
    from a location that will not be eaten by an async throw.
*/
function expose(e: Error) {
    setTimeout(() => { throw e; });
}

/*
    Shifts and returns a value inside the channel
    from either the buffer or the puts.
*/
function shift(ch: Channel) {
    if (ch.empty())
        // this error is never expected to be thrown
        // just a sanity check during development
        throw new Error('Attempted to execute shift(Channel) on an empty channel!');

    if (ch.buf.empty()) {
        ch.puts.shift()();
        return ch.buf.shift();
    }
    else {
        let val = ch.buf.shift();
        if (!ch.puts.empty())
            ch.puts.shift()();
        return val;
    }
}

/*
    Flushes out any remaining takes from the channel
    by sending them the value of `ACTIONS.DONE`.
*/
function flush(ch: Channel) {
    if (!ch.empty())
        // this error is never expected to be thrown
        // just a sanity check during development
        throw new Error('Attempted to execute flush(Channel) on a non-empty channel!');

    let take = null;
    while (take = ch.takes.shift())
        take(ACTIONS.DONE);
}

/*
    Marks a channel as ended, and signals any promises
    which are waiting for the end of the channel.
*/
function finish(ch: Channel) {
    ch.state = STATES.ENDED;
    for (let waiting of ch.waiting)
        waiting();
}

export function timeout(delay = 0) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, delay);
    });
}

const STATE = Symbol('channel_state');
export default class Channel {

    // A queue containing any puts which could not be placed directly onto the buffer
    puts: Queue;

    // A queue containing any takes waiting for values to be provided
    takes: Queue;

    // A queue containing values ready to be taken.
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
    */
    constructor(size: Number = Channel.DEFAULT_SIZE, transform: Function = x => x) {
        this.puts      = new Queue();
        this.takes     = new Queue();
        this.spacing   = new Queue();
        this.buf       = new FixedQueue(size);
        this.transform = transform;
        this.pipeline  = [];
        this.waiting   = [];
        this[STATE]    = STATES.OPEN;
    }

    /*
        A helper constructor which will convert any iterable into a channel,
        placing all of the iterable's values onto that channel.
    */
    static from(iterable, keepOpen = false) {
        let ch = new Channel();
        for (let val of iterable)
            ch.put(val);
        if (!keepOpen)
            ch.close();
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
        Marks a channel to no longer be writable.

        Accepts an optional boolean `all`, to signify
        whether or not to close the entire pipeline.
    */
    static close(ch: Channel, all: Boolean = false) {
        ch.state = STATES.CLOSED;
        if (ch.empty()) {
            flush(ch);
            finish(ch);
        }
        if (all)
            ch[SHOULD_CLOSE] = true;
    }

    /*
        Calls Channel.close for `this`, `all`.
    */
    close(all: Boolean = false) {
        Channel.close(this, all);
    }

    // static destroy(ch: Channel) {
    //     Channel.close(ch, true);
    // }

    // destroy() {
    //     Channel.destroy(this);
    // }

    /*
        Determines if a channel
        has any values left for `take` to use.
    */
    static empty(ch: Channel) {
        return ch.buf.empty() && ch.puts.empty();
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
            ch.puts.push(() => {
                val = ch.transform(val); // consider try/catch and exposing a stderr style channel
                ch.buf.push(val); // need val to be scoped for later execution
                resolve();
            });
            if (!ch.buf.full())
                ch.puts.shift()();
            if (!ch.takes.empty()) {
                ch.takes.shift()(shift(ch));
            }
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
                return resolve(Channel.DONE);
            ch.takes.push(x => resolve(x));
            if (!ch.empty()) {
                let val = shift(ch);
                let take = ch.takes.shift();
                take(val);
            }
            if (ch.state === STATES.CLOSED) {
                flush(ch);
                finish(ch); // order?
            }
        });
    }

    /*
        Returns Channel.take for `this`.
    */
    take() {
        return Channel.take(this);
    }

    /*
        Helper method for putting values onto a channel
        from a provided producer whenever there is space.

        CAREFUL WITH THIS.
        Right now, if we produce methods that can be run without any delay whatsoever,
        it is impossible to break out of the loop using regeneratorRuntime,
        even if we await timeout() then close the channel -- the await timeout() will never be passed.
    */
    static async produce(
          ch       : Channel
        , producer : Function
    ): Function
    {
        let spin = true;
        (async() => {
            try {
                while (spin) {
                    let val = producer();
                    if (val instanceof Promise)
                        val = await val;
                    else
                        // HACK WARNING (!!!)
                        // introduce asynchronous processing when function is synchronous
                        // to prevent users from shooting themselves in the foot by causing
                        // unbreakable infinite loops with non async producers.
                        await timeout();
                    let r = await ch.put(val);
                    if (r === Channel.DONE)
                        break;
                }
            }
            catch(e) {
                expose(e);
            }
        })();
        return () => { spin = false; };
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
    ): Function
    {
        let spin = true;
        (async() => {
            let val = null;
            while ((val = await ch.take()) !== Channel.DONE) {
                try {
                    await consumer(val);
                }
                catch(e) {
                    expose(e);
                }
            }
        })();
        return () => { spin = false; };
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
        return new Promise((resolve, reject) => {
            if (ch.state === STATES.ENDED)
                return resolve();
            else
                ch.waiting.push(() => { resolve(); });
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
    static pipeline(...functions) {
        let channels = [];
        for (let fn of functions)
            channels.push(new Channel(1, fn));
        channels.reduce((x, y) => {
            return x.pipe(y);
        });
        return [
              channels[0]
            , channels[channels.length - 1]
        ];
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
    static pipe(parent: Channel, ...channels: Array<Channel>) : Channel {
        parent.pipeline.push(...channels);
        if (!parent[ACTIONS.CANCEL]) {
            let running = true;
            (async() => {
                while (running) {
                    let take = parent.take();
                    take[CHANNEL_SOURCE] = parent;
                    let val = await take;
                    if (val === Channel.DONE) {
                        if (parent[SHOULD_CLOSE]) {
                            for (let channel of parent.pipeline)
                                channel.close(true);
                        }
                        break;
                    }
                    /* eslint no-loop-func: 0 */
                    await* parent.pipeline.map(x => x.put(val));
                }
            })();
            parent[ACTIONS.CANCEL] = () => {
                running = false;
                // log(parent);
                // log(parent.takes);
                for (let take of parent.takes) {
                    // log(take[CHANNEL_SOURCE]);
                }
            };
        }
        return channels[channels.length - 1];
    }

    /*
        Returns Channel.pipe for `this`, `...channels`.
    */
    pipe(...channels: Array<Channel>) : Channel {
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

    // UNTESTED. CARE.
    static unpipe(parent: Channel, ...channels: Array<Channel>) {
        for (let [index, pipe] of Array.entries(parent.pipeline)) {
            for (let ch2 of channels) {
                if (pipe === ch2) {
                    // optimize later
                    parent.pipeline.splice(index, 1); // is this safe? multiple splices while iterating? seems scurry..
                }
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

Channel.DEFAULT_SIZE = 8;
Channel.DONE = ACTIONS.DONE; // expose this so loops can listen for it
