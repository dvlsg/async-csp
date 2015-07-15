import Channel, { STATES, timeout } from '../src/channel.js';
import {Queue, FixedQueue} from '../src/data-structures.js';
import assert from 'zana-assert';
import wrapMocha from './util/wrap-mocha.js'; // executes automatically
let log = console.log.bind(console);

describe('Channel', function() {

    this.timeout(100);

    describe('constructor', () => {
        it('should initialize properly', async() => {
            let ch = new Channel();
            
            assert.true(ch.empty());
            assert.is(ch, Channel);
            assert.equal(ch.state, STATES.OPEN);

            assert.exists(ch.puts);
            assert.is(ch.puts, Queue);
            assert.true(ch.puts.empty());

            assert.exists(ch.takes);
            assert.is(ch.takes, Queue);
            assert.true(ch.takes.empty());

            assert.exists(ch.buf);
            assert.is(ch.buf, FixedQueue);
            assert.true(ch.buf.empty());
            assert.equal(ch.buf.size, Channel.DEFAULT_SIZE);

            assert.exists(ch.pipeline);
            assert.empty(ch.pipeline);
            assert.is(ch.pipeline, Array);

            assert.exists(ch.waiting);
            assert.empty(ch.waiting);
            assert.is(ch.waiting, Array);
        });

        it('should initialize with a buffer size', async() => {
            let ch = new Channel(92);
            assert.true(ch.empty());
            assert.true(ch.buf.empty());
            assert.equal(ch.buf.size, 92);
        });

        it('should initialize with a transform', async() => {
            let ch = new Channel(x => x**2);
            for (let i = 0; i < 4; i++)
                await ch.put(i);
            for (let i = 0; i < 4; i++)
                assert.equal(await ch.take(), i**2);
        });

        it('should initialize with a buffer size and a transform', async() => {
            let ch = new Channel(3, x => ({x}));
            for (let i = 0; i < 3; i++)
                await ch.put(i);
            assert.equal(await ch.take(), {x: 0});
            assert.equal(await ch.take(), {x: 1});
            assert.equal(await ch.take(), {x: 2});
        });
    });

    describe('size', () => {

        it('should equal Channel.DEFAULT_SIZE with default constructor', () => {
            let ch = new Channel();
            assert.equal(ch.size, Channel.DEFAULT_SIZE);
        });

        it('should equal the size provided to the constructor', () => {
            let ch = new Channel(96);
            assert.equal(ch.size, 96);
        });
    });

    describe('length', () => {

        it('should equal buffer length plus puts length', async() => {
            let ch = new Channel(2);
            assert.equal(ch.length, 0);
            assert.equal(ch.length, ch.buf.length + ch.puts.length);
            await ch.put(1);
            assert.equal(ch.length, 1);
            assert.equal(ch.length, ch.buf.length + ch.puts.length);
            await ch.put(2);
            assert.equal(ch.length, 2);
            assert.equal(ch.length, ch.buf.length + ch.puts.length);
            ch.put(3);
            assert.equal(ch.length, 3);
            assert.equal(ch.length, ch.buf.length + ch.puts.length);
        });
    });

    describe('empty', () => {

        it('should be true when buffer and puts queue are empty', async() => {
            let ch = new Channel();
            assert.true(ch.puts.empty());
            assert.true(ch.buf.empty());
            assert.true(ch.empty());
        });

        it('should be false when buffer is non empty', async() => {
            let ch = Channel.from([1,2,3]);
            assert.true(ch.puts.empty());
            assert.false(ch.buf.empty());
            assert.false(ch.empty());
        });

        it('should be true even if takes queue is non empty', async() => {
            let ch = new Channel();
            let take = ch.take();
            assert.true(ch.puts.empty());
            assert.true(ch.buf.empty());
            assert.false(ch.takes.empty());
            assert.true(ch.empty());
        });

        it('can be empty when open', async() => {
            let ch = new Channel();
            assert.equal(ch.state, STATES.OPEN);
            assert.true(ch.empty());
        });

        it('can be non-empty when open', async() => {
            let ch = new Channel();
            await ch.put(1);
            assert.equal(ch.state, STATES.OPEN);
            assert.false(ch.empty());
        });

        it('should be non-empty when closed', async() => {
            let ch = new Channel();
            await ch.put(1);
            ch.close();
            assert.equal(ch.state, STATES.CLOSED);
            assert.false(ch.empty());
        });

        it('should be empty when ended', async() => {
            let ch = new Channel();
            await ch.put(1);
            ch.close();
            await ch.take();
            assert.equal(ch.state, STATES.ENDED);
            assert.true(ch.empty());
        });
    });

    describe('put', () => {

        it('should return a promise', async() => {
            let ch = new Channel();
            let take = ch.take();
            assert.is(take, Promise);
        });

        it('should put a value', async() => {
            let ch = new Channel();
            assert.true(ch.empty());
            await ch.put(1);
            assert.false(ch.empty());
            assert.equal(ch.buf.length, 1);
            assert.true(ch.puts.empty());
        });

        it('should execute any available transform', async() => {
            let ch = new Channel(x => x**2);
            for (let val of [1, 2, 3, 4, 5])
                await ch.put(val);
            assert.equal(await ch.take(), 1);
            assert.equal(await ch.take(), 4);
            assert.equal(await ch.take(), 9);
            assert.equal(await ch.take(), 16);
            assert.equal(await ch.take(), 25);
        });

        it('should put values in order', async() => {
            let ch = new Channel(8);
            for (let val of [1,2,3,4,5])
                await ch.put(val);
            assert.equal(await ch.take(), 1);
            assert.equal(await ch.take(), 2);
            assert.equal(await ch.take(), 3);
            assert.equal(await ch.take(), 4);
            assert.equal(await ch.take(), 5);
        });

        it('should queue puts when buffer is full', async() => {
            let ch = new Channel(1);
            await ch.put(1);
            ch.put(2);
            assert.false(ch.empty());
            assert.true(ch.buf.full());
            assert.false(ch.puts.empty());
            assert.equal(ch.puts.length, 1);
        });

        it('should resolve puts when buffer becomes not full', async() => {
            let ch = new Channel(1);
            await ch.put(1);
            let put = ch.put(2);
            assert.true(ch.buf.full());
            assert.false(ch.puts.empty());
            await ch.take();
            await put;
            assert.true(ch.puts.empty());
            assert.true(ch.buf.full());
        });
    });

    describe('take', () => {

        it('should return a promise', async() => {
            let ch = new Channel();
            let take = ch.take();
            assert.is(take, Promise);
        });

        it('should take values', async() => {
            let ch = new Channel(10);
            await ch.put(1);
            assert.equal(await ch.take(), 1);
            assert.true(ch.empty());
            assert.true(ch.takes.empty());
        });

        it('should take values in order', async() => {
            let ch = new Channel(10);
            let counter = 0;
            for (let i = 0; i < 10; i++)
                await ch.put(counter += Math.random());
            let arr = [];
            for (let i = 0; i < 10; i++)
                arr.push(await ch.take());
            for (let i = 0; i < arr.length-1; i++)
                assert.true(arr[i] <= arr[i+1]);
        });

        it('should queue takes when buffer is empty', async() => {
            let ch = new Channel();
            assert.true(ch.takes.empty());
            ch.take();
            assert.false(ch.takes.empty());
        });

        it('should resolve takes when buffer becomes non empty', async() => {
            let ch = new Channel();
            assert.true(ch.takes.empty());
            let take = ch.take();
            assert.false(ch.takes.empty());
            ch.put(1);
            assert.equal(await take, 1);
        });
    });

    describe('from', () => {

        it('can initialize a channel from an array', async() => {
            let arr = [1,2,3,4,5];
            let ch = Channel.from([1,2,3,4,5]);
            assert.equal(arr.length, ch.buf.length);
            for (let [key, val] of arr.entries())
                assert.equal(await ch.take(), val);
            assert.true(ch.empty());
            assert.equal(ch.state, STATES.ENDED);
        });

        it('can initialize a channel from a generator', async() => {
            let gen = function*() { yield 1; yield 2; yield 3; };
            let ch = Channel.from(gen());
            assert.equal(ch.buf.length, 3);
            let val = null;
            let i = 1;
            while((val = await ch.take()) !== Channel.DONE)
                assert.equal(val, i++);
        });

        it('can initialize a channel from any iterable', async() => {
            let obj = {
                *[Symbol.iterator]() { yield 4; yield 5; yield 6; }
            };
            let ch = Channel.from(obj);
            assert.equal(ch.buf.length, 3);
            let val = null;
            let i = 4;
            while((val = await ch.take()) !== Channel.DONE)
                assert.equal(val, i++);
        });

        it('should initialize the channel as closed', async() => {
            let ch = Channel.from([1,2,3]);
            assert.equal(ch.state, STATES.CLOSED);
        });

        it('can leave the channel open by flag', async() => {
            let ch = Channel.from([1,2,3], true);
            assert.equal(ch.state, STATES.OPEN);
        });
    });

    describe('close', () => {

        it('should close a non-empty channel', async() => {
            let ch = new Channel();
            await ch.put(1);
            assert.equal(ch.state, STATES.OPEN);
            ch.close();
            assert.equal(ch.state, STATES.CLOSED);
        });

        it('should end an empty channel', async() => {
            let ch = new Channel();
            assert.equal(ch.state, STATES.OPEN);
            ch.close();
            await ch.done();
            assert.equal(ch.state, STATES.ENDED);
        });

        it('should swap from closed to ended on closed channel emptied', async() => {
            let ch = new Channel();
            assert.equal(ch.state, STATES.OPEN);
            await ch.put(1);
            assert.equal(ch.state, STATES.OPEN);
            ch.close();
            assert.equal(ch.state, STATES.CLOSED);
            await ch.take();
            assert.equal(ch.state, STATES.ENDED);
        });
    });

    describe('done', () => {

        it('should return a promise', async() => {
            let ch = new Channel();
            let d = ch.done();
            assert.is(d, Promise);
        });

        it('should resolve when the channel is ended', async() => {
            let ch = new Channel();
            let d = ch.done();
            assert.equal(ch.state, STATES.OPEN);
            ch.close();
            await d;
            assert.equal(ch.state, STATES.ENDED);
        });

        it('should resolve all promises when the channel is ended', async() => {
            let ch = new Channel();
            let [d1, d2, d3] = [ch.done(), ch.done(), ch.done()];
            assert.equal(ch.state, STATES.OPEN);
            ch.close();
            await* [d1, d2, d3];
            assert.equal(ch.state, STATES.ENDED);
        });
    });

    describe('pipe', () => {

        it('should pipe values from one channel to another channel', async() => {
            let ch1 = new Channel();
            let ch2 = new Channel();
            ch1.pipe(ch2);
            await ch1.put(1);
            assert.equal(await ch2.take(), 1);
            assert.equal(ch1.pipeline, [ch2]);
            assert.empty(ch2.pipeline);
            assert.true(ch1.empty());
            assert.true(ch2.empty());
        });

        it('should pipe values through multiple chained pipes', async() => {
            let ch1 = new Channel();
            let ch2 = new Channel();
            let ch3 = new Channel();
            ch1.pipe(ch2).pipe(ch3);
            await ch1.put(1);
            let take = await ch3.take();
            assert.equal(take, 1);
            assert.true(ch1.empty());
            assert.true(ch2.empty());
            assert.true(ch3.empty());
        });

        it('can pipe from one channel split to multiple channels', async() => {
            let ch1 = new Channel();
            let ch2 = new Channel();
            let ch3 = new Channel();
            ch1.pipe(ch2, ch3);
            await ch1.put(1);
            let [take2, take3] = await* [ch2.take(), ch3.take()];
            assert.equal(take2, 1);
            assert.equal(take3, 1);
            assert.true(ch1.empty());
            assert.true(ch2.empty());
            assert.true(ch3.empty());
        });

        it('should return a reference to the last channel in the pipe', async() => {
            let ch1 = new Channel();
            let ch2 = new Channel();
            let ref = ch1.pipe(ch2);
            assert.equal(ref, ch2);
        });

        it('should execute any available transforms in the pipeline', async() => {
            let ch1 = new Channel(8, x => x + 2);
            let ch2 = new Channel(8, x => ({x}));
            let ch3 = new Channel(8, x => ({y: x.x}));
            ch1.pipe(ch2).pipe(ch3);
            for (let i = 0; i < 5; i++)
                await ch1.put(i);
            for (let i = 0; i < 5; i++)
                assert.equal(await ch3.take(), {y: i+2});
        });

        it('should be able to put values onto any channel', async() => {
            let ch1 = new Channel();
            let ch2 = new Channel();
            let ch3 = new Channel();
            ch1.pipe(ch2).pipe(ch3);
            await ch2.put(2);
            assert.equal(await ch3.take(), 2);
            assert.true(ch1.empty());
            assert.true(ch2.empty());
            assert.true(ch3.empty());
        });

        it('should pipe values which were already buffered', async() => {
            let ch1 = new Channel();
            let ch2 = new Channel();
            for (let i = 0; i < 4; i++)
                await ch1.put(i);
            ch1.pipe(ch2);
            for (let i = 0; i < 4; i++)
                assert.equal(await ch2.take(), i);
        });

        it('should block pipes when backed up', async() => {
            let ch1 = new Channel(2);
            let ch2 = new Channel(2);
            let ch3 = new Channel(4);
            ch1.pipe(ch2, ch3);
            await ch1.put(1);
            await ch1.put(2);
            let put3 = ch1.put(3);
            let put4 = ch1.put(4);
            await timeout(); // hacky, but put3 and put4 will not be resolved immediately
            
            // ch1 should not be empty already, but the 3rd value will be taken off the buffer
            // and will be hanging out in a hidden context waiting to be resolved on all pipes
            // the 4th value should remain on the buffer until the pipe is unblocked
            assert.false(ch1.empty());
            assert.equal(ch1.buf.length, 1);
            assert.empty(ch1.puts);
            assert.empty(ch1.takes);

            // the 3rd value will not be placed on the 2nd channel, since the max size of ch2 is 2
            assert.false(ch2.empty());
            assert.equal(ch2.buf.length, 2);
            assert.equal(ch2.puts.length, 1);
            assert.empty(ch2.takes);

            // the 3rd value will be placed on the 3rd channel, since the max size of ch3 is 4
            assert.false(ch3.empty());
            assert.equal(ch3.buf.length, 3);
            assert.empty(ch3.puts);
            assert.empty(ch3.takes);

            let take3 = await ch3.take();

            // ch1 should be unchanged, since the pipe is still blocked
            assert.false(ch1.empty());
            assert.equal(ch1.buf.length, 1);
            assert.empty(ch1.puts);
            assert.empty(ch1.takes);

            // ch2 should be unchanged, still blocking the pipe
            assert.false(ch2.empty());
            assert.equal(ch2.buf.length, 2);
            assert.equal(ch2.puts.length, 1);
            assert.empty(ch2.takes);

            // ch3 should have a value removed from its buffer
            assert.false(ch3.empty());
            assert.equal(ch3.buf.length, 2);
            assert.empty(ch3.puts);
            assert.empty(ch3.takes);
            assert.equal(take3, 1);

            let take2 = await ch2.take();
            await timeout(); // to ensure the next value is pulled from the ch1 before we continue

            // ch1 should have had its last value taken
            assert.true(ch1.empty());
            assert.empty(ch1.buf);
            assert.empty(ch1.puts);
            assert.empty(ch1.takes);

            // ch2 should have unblocked space for 1 value, then reblocked ch1 from putting again
            assert.false(ch2.empty());
            assert.equal(take2, 1);
            assert.equal(ch2.buf.length, 2);
            assert.equal(ch2.puts.length, 1);
            assert.empty(ch2.takes);

            // ch3 should have the next value from ch1 placed on its buffer
            assert.false(ch3.empty());
            assert.equal(ch3.buf.length, 3);
            assert.empty(ch3.puts);
            assert.empty(ch3.takes);

            [take2, take3] = await* [ch2.take(), ch3.take()];

            // ch2 should have accepted the last value from ch1
            assert.equal(take2, 2);
            assert.false(ch2.empty());
            assert.equal(ch2.buf.length, 2);
            assert.empty(ch2.puts);
            assert.empty(ch2.takes);

            // ch3 should have another value taken
            assert.equal(take3, 2);
            assert.false(ch3.empty());
            assert.equal(ch3.buf.length, 2);
            assert.empty(ch3.puts);
            assert.empty(ch3.takes);
        });

        it('should be able to close single channels', async() => {
            let ch1 = new Channel(4);
            let ch2 = new Channel(4);
            for (let i = 0; i < 4; i++)
                await ch1.put(i);
            ch1.close();
            ch1.pipe(ch2);
            await ch1.done();
            assert.equal(ch1.state, STATES.ENDED);
            assert.equal(ch2.state, STATES.OPEN);
        });

        it('should be able to close the entire pipeline', async() => {
            let ch1 = new Channel(4);
            let ch2 = new Channel(4);
            let ch3 = new Channel(4);
            for (let i = 0; i < 4; i++)
                await ch1.put(i);
            ch1.pipe(ch2).pipe(ch3);
            ch1.close(true);
            await timeout();
            assert.equal(ch1.state, STATES.ENDED);
            assert.equal(ch2.state, STATES.ENDED);
            assert.equal(ch3.state, STATES.CLOSED); // this should be closed, not ended. oops.
            assert.equal(ch3.buf.length, 4);
        });
    });

    describe('unpipe', () => {

        it('should remove a channel from a pipeline', async() => {
            let ch1 = new Channel(2);
            let ch2 = new Channel(2);
            let ch3 = new Channel(3);
            ch1.pipe(ch2);
            assert.equal(ch1.pipeline, [ch2]);
            ch1.unpipe(ch2);
            assert.equal(ch1.pipeline, []);
        });

        it('should return a reference to an existing channel', async() => {
            let ch1 = new Channel();
            let ch2 = new Channel();
            ch1.pipe(ch2);
            let unpiped = ch1.unpipe(ch2);
            assert.equal(ch1, unpiped);
        });

        it('should stop the automated flow of data', async() => {
            let ch1 = new Channel(2);
            let ch2 = ch1.pipe(new Channel(2));
            await ch1.put(1);
            await ch1.put(2);
            ch1.put(3);
            ch1.put(4);
            await timeout();
            ch1.unpipe(ch2);
            assert.equal(await ch2.take(), 1);
            assert.equal(await ch2.take(), 2);
            
            assert.false(ch2.empty());
            // note this - since 3 is already queued up in ch2.puts,
            // it will STILL be received inside channel 2
            // is this intended behavior? unexpected? bug to be fixed?
            // as of right now, i feel this is intended and OK.
            assert.equal(await ch2.take(), 3);
            assert.true(ch2.empty());
            assert.empty(ch2.takes);

            assert.false(ch1.empty());
            assert.equal(await ch1.take(), 4);
            assert.true(ch1.empty());
            assert.empty(ch1.takes);
        });

        it('should keep child pipes intact', async() => {
            let ch1 = new Channel(2);
            let ch2 = new Channel(2);
            let ch3 = new Channel(2);
            ch1.pipe(ch2).pipe(ch3);
            assert.equal(ch1.pipeline, [ch2]);
            assert.equal(ch2.pipeline, [ch3]);
            await ch1.put(1);
            await ch1.put(2);
            assert.equal(await ch3.take(), 1);
            assert.equal(await ch3.take(), 2);
            ch1.unpipe(ch2);
            assert.equal(ch1.pipeline, []);
            assert.equal(ch2.pipeline, [ch3]);
            await ch2.put(3);
            await ch2.put(4);
            assert.equal(await ch3.take(), 3);
            assert.equal(await ch3.take(), 4);
        });

        it('should keep sibling pipes intact', async() => {
            let ch1 = new Channel(4);
            let ch2 = new Channel(2);
            let ch3 = new Channel(2);

            ch1.pipe(ch2, ch3);
            assert.equal(ch1.pipeline, [ch2, ch3]);
            await ch1.put(1);
            await ch1.put(2);
            await timeout(); // make sure the puts are through before unpipe

            ch1.unpipe(ch2);
            assert.equal(ch1.pipeline, [ch3]);

            await ch1.put(3);
            await ch1.put(4);
            assert.equal(await ch2.take(), 1);
            assert.equal(await ch2.take(), 2);
            assert.true(ch2.empty());
            assert.empty(ch2.takes);

            assert.equal(await ch3.take(), 1);
            assert.equal(await ch3.take(), 2);
            assert.equal(await ch3.take(), 3);
            assert.equal(await ch3.take(), 4);
            assert.true(ch3.empty());
            assert.empty(ch3.takes);

            assert.true(ch1.empty());
            assert.empty(ch1.takes);
        });
    });

    describe('merge', () => {

        it('should put values from multiple channels onto a new channel', async() => {
            let ch1 = new Channel();
            let ch2 = new Channel();

            let ch3 = ch1.merge(ch2); // or Channel.merge(ch1, ch2)
            await ch1.put(1);
            await ch2.put(2);
            assert.equal(await ch3.take(), 1);
            assert.equal(await ch3.take(), 2);
        });
        // any other tests?
    });

    describe('produce', () => {

        it('should automatically produce values when space is available', async() => {
            let ch = new Channel();
            let counter = 0;
            ch.produce(() => counter++);
            for (let i = 0; i < 10; i++)
                assert.equal(await ch.take(), i);
        });

        it('can produce values synchronously', async() => {
            let ch = new Channel();
            ch.produce(Math.random);
            for (let i = 0; i < 10; i++) {
                let val = await ch.take();
                assert.true(0 <= val && val < 1);
            }
        });

        it('can produce values asynchronously', async() => {
            let ch = new Channel();
            let counter = 0;
            ch.produce(async() => {
                await timeout();
                return counter++;
            });
            for (let i = 0; i < 10; i++)
                assert.equal(await ch.take(), i);
        });
    });

    describe('consume', () => {

        it('can consume values synchronously', async() => {
            let ch = new Channel();
            let counter = 0;
            ch.consume(x => {
                counter += x;
            });
            await ch.put(1);
            await ch.put(2);
            await ch.put(3);
            await ch.put(4);
            await ch.put(5);
            ch.close();
            await ch.done();
            assert.equal(counter, 15);
        });

        it('can consume values asynchronously', async() => {
            let ch = new Channel();
            let counter = 0;
            ch.consume(async(x) => {
                await timeout();
                counter += x;
            });
            await ch.put(1);
            await ch.put(2);
            await ch.put(3);
            await ch.put(4);
            await ch.put(5);
            ch.close();
            await ch.done();
            assert.equal(counter, 15);
        });
    });

    describe('transform', () => {

        it('should transform values', async() => {
            let ch = new Channel(x => x**2);
            for (let i = 1; i <= 4; i++)
                await ch.put(i);
            for (let i = 0; i < 4; i++)
                assert.equal(await ch.take(), (i + 1) ** 2);
        });

        it('should drop undefined values', async() => {
            let ch = new Channel(x => {
                if (x > 2)
                    return x;
            });
            await ch.put(1);
            await ch.put(1);
            await ch.put(3);
            await ch.put(4);
            assert.equal(await ch.take(), 3);
            assert.equal(await ch.take(), 4);
            assert.empty(ch);
        });

        it('should transform values by callback', async() => {
            let ch = new Channel((x, push) => {
                if (x > 2)
                    push(x);
            });
            await ch.put(1);
            await ch.put(2);
            await ch.put(3);
            await ch.put(4);
            assert.equal(await ch.take(), 3);
            assert.equal(await ch.take(), 4);
            assert.empty(ch);
        });

        it('should expand values by multiple callback executions', async() => {
            let ch = new Channel(20, (x, push) => {
                if (x > 2) {
                    push(x);
                    push(x);
                }
            });
            await ch.put(1);
            await ch.put(2);
            await ch.put(3);
            await ch.put(4);
            assert.equal(await ch.take(), 3);
            assert.equal(await ch.take(), 3);
            assert.equal(await ch.take(), 4);
            assert.equal(await ch.take(), 4);
            assert.empty(ch);
        });

        it('should maintain order with multiple callback transforms', async() => {
            let ch = new Channel(2, (val, push, done) => {
                if (val > 2) {
                    push(val);
                    push(val*2);
                    push(val*3);
                }
                setTimeout(done, 10);
            });

            let arr = [];
            ch.consume(async x => {
                arr.push(x);
            });
            await ch.put(1);
            await ch.put(2);
            await ch.put(3);
            await ch.put(4);
            await ch.put(5);
            await ch.put(6);
            await timeout();
            ch.close(true);
            await ch.done();
            assert.equal(arr, [3, 6, 9, 4, 8, 12, 5, 10, 15, 6, 12, 18]);
        });

    });

    describe('general use', () => {

        it('should not block indefinitely with synchronous produce + consume', async() => {
            let ch = new Channel();
            ch.produce(Math.random);
            ch.consume(x => x**2);
            await timeout(50); // let it spin for a while
            ch.close(); // close, and continue spinning until empty
            await ch.done();
            assert.true(ch.empty());
            assert.equal(ch.state, STATES.ENDED);
        });
        
    });

});