'use strict'

const { STATES, timeout, default: Channel } = require('../src/channel')
const {
  List,
  FixedQueue,
  DroppingBuffer,
  SlidingBuffer,
} = require('../src/data-structures')
const { assert } = require('chai')
const log = console.log.bind(console) // eslint-disable-line

describe('Channel', function() {
  this.timeout(100)

  describe('constructor', () => {
    it('should initialize properly', async () => {
      const ch = new Channel()

      assert.isOk(ch.empty())
      assert.instanceOf(ch, Channel)
      assert.deepEqual(ch.state, STATES.OPEN)

      assert.isOk(ch.puts)
      assert.instanceOf(ch.puts, List)
      assert.isOk(ch.puts.empty())

      assert.isOk(ch.takes)
      assert.instanceOf(ch.takes, List)
      assert.isOk(ch.takes.empty())

      assert.isOk(ch.pipeline)
      assert.strictEqual(ch.pipeline.length, 0)
      assert.instanceOf(ch.pipeline, Array)

      assert.isOk(ch.waiting)
      assert.strictEqual(ch.waiting.length, 0)
      assert.instanceOf(ch.waiting, Array)
    })

    it('should initialize with a buffer size', async () => {
      const ch = new Channel(92)
      assert.isOk(ch.empty())
      assert.isOk(ch.buf)
      assert.instanceOf(ch.buf, FixedQueue)
      assert.isOk(ch.buf.empty())
      assert.deepEqual(ch.buf.size, 92)
    })

    it('should initialize with a transform', async () => {
      const fn = x => x ** 2
      const ch = new Channel(fn)
      assert.deepEqual(ch.transform, fn)
    })

    it('should initialize with a buffer size and a transform', async () => {
      const fn = x => ({ x })
      const size = 3
      const ch = new Channel(size, fn)
      assert.isOk(ch.buf)
      assert.isOk(ch.buf.empty())
      assert.isNotOk(ch.buf.full())
      assert.deepEqual(ch.buf.size, size)
      assert.deepEqual(ch.transform, fn)
    })

    it('should accept data structures as first parameter', async () => {
      const size = 8
      const buf = new FixedQueue(size)
      const ch = new Channel(buf)
      assert.isOk(ch.buf)
      assert.isOk(ch.buf.empty())
      assert.isNotOk(ch.buf.full())
      assert.deepEqual(ch.buf.size, size)
    })
  })

  describe('.from()', () => {
    it('can initialize a channel from an array', async () => {
      const arr = [1, 2, 3, 4, 5]
      const ch = Channel.from(arr)
      assert.deepEqual(arr.length, ch.buf.length)
      for (const val of arr) assert.deepEqual(await ch.take(), val)
      assert.isOk(ch.empty())
      await ch.done()
      assert.deepEqual(ch.state, STATES.ENDED)
    })

    it('can initialize a channel from a generator', async () => {
      const gen = function*() {
        yield 1
        yield 2
        yield 3
      }
      const ch = Channel.from(gen())
      assert.deepEqual(ch.buf.length, 3)
      let val = null
      let i = 1
      while ((val = await ch.take()) !== Channel.DONE)
        assert.deepEqual(val, i++)
    })

    it('can initialize a channel from any iterable', async () => {
      const obj = {
        *[Symbol.iterator]() {
          yield 4
          yield 5
          yield 6
        },
      }
      const ch = Channel.from(obj)
      assert.deepEqual(ch.buf.length, 3)
      let val = null
      let i = 4
      while ((val = await ch.take()) !== Channel.DONE)
        assert.deepEqual(val, i++)
    })

    it('should initialize the channel as closed', async () => {
      const ch = Channel.from([1, 2, 3])
      assert.deepEqual(ch.state, STATES.CLOSED)
    })

    it('can leave the channel open by flag', async () => {
      const ch = Channel.from([1, 2, 3], true)
      assert.deepEqual(ch.state, STATES.OPEN)
    })
  })

  describe('#size', () => {
    it('should be undefined when no buffer is used', () => {
      const ch = new Channel()
      assert.deepEqual(ch.size, undefined)
    })

    it('should be the size of the buffer when a buffer is used', () => {
      const ch = new Channel(96)
      assert.deepEqual(ch.size, 96)
    })
  })

  describe('#length', () => {
    it('should equal puts length', async () => {
      const ch = new Channel()
      assert.deepEqual(ch.length, 0)
      assert.deepEqual(ch.length, ch.puts.length)
      ch.put(1)
      assert.deepEqual(ch.length, 1)
      assert.deepEqual(ch.length, ch.puts.length)
      ch.put(2)
      assert.deepEqual(ch.length, 2)
      assert.deepEqual(ch.length, ch.puts.length)
      await ch.take()
      assert.deepEqual(ch.length, 1)
      assert.deepEqual(ch.length, ch.puts.length)
    })

    it('should equal puts length plus buffer length', async () => {
      const ch = new Channel(2)
      assert.deepEqual(ch.length, 0)
      assert.deepEqual(ch.buf.length, 0)
      assert.deepEqual(ch.puts.length, 0)
      await ch.put(1)
      assert.deepEqual(ch.length, 1)
      assert.deepEqual(ch.buf.length, 1)
      assert.deepEqual(ch.puts.length, 0)
      await ch.put(2)
      assert.deepEqual(ch.length, 2)
      assert.deepEqual(ch.buf.length, 2)
      assert.deepEqual(ch.puts.length, 0)
      ch.put(3)
      assert.deepEqual(ch.length, 3)
      assert.deepEqual(ch.buf.length, 2)
      assert.deepEqual(ch.puts.length, 1)
    })
  })

  describe('#empty()', () => {
    it('should be true when puts queue is empty', async () => {
      const ch = new Channel()
      assert.isOk(ch.puts.empty())
      assert.isOk(ch.empty())
    })

    it('should be true when buffer and puts queue are empty', async () => {
      const ch = new Channel(1)
      assert.isOk(ch.puts.empty())
      assert.isOk(ch.buf.empty())
      assert.isOk(ch.empty())
    })

    it('should be false when puts queue is non empty', async () => {
      const ch = new Channel()
      ch.put(1)
      assert.isNotOk(ch.puts.empty())
      assert.isNotOk(ch.empty())
    })

    it('should be false when buffer is non empty', async () => {
      const ch = Channel.from([1, 2, 3])
      assert.isOk(ch.puts.empty())
      assert.isNotOk(ch.buf.empty())
      assert.isNotOk(ch.empty())
    })

    it('should be true even if takes queue is non empty', async () => {
      const ch = new Channel()
      ch.take()
      assert.isOk(ch.puts.empty())
      assert.isNotOk(ch.takes.empty())
      assert.isOk(ch.empty())
    })

    it('can be empty when open', async () => {
      const ch = new Channel()
      assert.deepEqual(ch.state, STATES.OPEN)
      assert.isOk(ch.empty())
    })

    it('can be non-empty when open', async () => {
      const ch = new Channel()
      ch.put(1)
      assert.deepEqual(ch.state, STATES.OPEN)
      assert.isNotOk(ch.empty())
    })

    it('can be non-empty when closed', async () => {
      const ch = new Channel(1)
      ch.put(1)
      ch.close()
      assert.deepEqual(ch.state, STATES.CLOSED)
      assert.isNotOk(ch.empty())
    })

    it('should be empty when ended', async () => {
      const ch = new Channel()
      ch.put(1)
      ch.close()
      await ch.take()
      await ch.done()
      assert.deepEqual(ch.state, STATES.ENDED)
      assert.isOk(ch.empty())
    })
  })

  describe('#put()', () => {
    it('should return a promise', async () => {
      const ch = new Channel()
      const put = ch.put(1)
      assert.instanceOf(put, Promise)
    })

    it('should put a value', async () => {
      const ch = new Channel()
      assert.isOk(ch.empty())
      ch.put(1)
      assert.isNotOk(ch.empty())
      assert.isNotOk(ch.puts.empty())
    })

    it('should put values in order', async () => {
      const ch = new Channel()
      for (const val of [1, 2, 3, 4, 5]) ch.put(val)
      assert.deepEqual(await ch.take(), 1)
      assert.deepEqual(await ch.take(), 2)
      assert.deepEqual(await ch.take(), 3)
      assert.deepEqual(await ch.take(), 4)
      assert.deepEqual(await ch.take(), 5)
    })

    it('should queue puts when buffer is full', async () => {
      const ch = new Channel(1)
      await ch.put(1)
      ch.put(2)
      assert.isNotOk(ch.empty())
      assert.isOk(ch.buf.full())
      assert.isNotOk(ch.puts.empty())
      assert.deepEqual(ch.puts.length, 1)
    })

    it('should resolve puts when buffer becomes not full', async () => {
      const ch = new Channel(1)
      await ch.put(1)
      const put = ch.put(2)
      assert.isOk(ch.buf.full())
      assert.isNotOk(ch.puts.empty())
      await ch.take()
      await put
      assert.isOk(ch.puts.empty())
      assert.isOk(ch.buf.full())
    })
  })

  describe('#take()', () => {
    it('should return a promise', async () => {
      const ch = new Channel()
      const take = ch.take()
      assert.instanceOf(take, Promise)
    })

    it('should take values', async () => {
      const ch = new Channel()
      ch.put(1)
      assert.deepEqual(await ch.take(), 1)
      assert.isOk(ch.empty())
      assert.isOk(ch.takes.empty())
    })

    it('should take values in order', async () => {
      const ch = new Channel()
      let counter = 0
      for (let i = 0; i < 10; i++) ch.put((counter += Math.random()))
      const arr = []
      for (let i = 0; i < 10; i++) arr.push(await ch.take())
      for (let i = 0; i < arr.length - 1; i++) assert.isOk(arr[i] <= arr[i + 1])
    })

    it('should queue takes when buffer is empty', async () => {
      const ch = new Channel()
      assert.isOk(ch.takes.empty())
      ch.take()
      assert.isNotOk(ch.takes.empty())
    })

    it('should resolve takes when buffer becomes non empty', async () => {
      const ch = new Channel()
      assert.isOk(ch.takes.empty())
      const take = ch.take()
      assert.isNotOk(ch.takes.empty())
      ch.put(1)
      assert.deepEqual(await take, 1)
    })

    it('should execute any available transform', async () => {
      const ch = new Channel(x => x ** 2)
      for (const val of [1, 2, 3, 4, 5]) ch.put(val)
      assert.deepEqual(await ch.take(), 1)
      assert.deepEqual(await ch.take(), 4)
      assert.deepEqual(await ch.take(), 9)
      assert.deepEqual(await ch.take(), 16)
      assert.deepEqual(await ch.take(), 25)
    })
  })

  describe('#tail()', () => {
    // revisit later, less important

    it('should return a promise', () => {
      const ch = new Channel()
      const tail = ch.tail()
      assert.instanceOf(tail, Promise)
    })

    it('should append values to the end of the channel', async () => {
      const ch = new Channel()
      ch.tail(4)
      ch.put(1)
      ch.tail(5)
      ch.put(2)
      ch.put(3)
      ch.close()
      for (let i = 0; i < 5; i++) assert.deepEqual(await ch.take(), i + 1)
    })

    it('should keep state at closed until tail is emptied', async () => {
      const ch = new Channel()
      ch.tail(1)
      ch.close()
      assert.deepEqual(ch.state, STATES.CLOSED)
      await ch.take()
      await ch.done()
      assert.deepEqual(ch.state, STATES.ENDED)
    })

    it('should use transforms', async () => {
      const ch = new Channel(async x => x + 2)
      ch.tail(1)
      ch.tail(2)
      ch.tail(3)
      ch.close()
      for (let i = 0; i < ch.tail.length; i++)
        assert.deepEqual(await ch.take(), i + 3)
    })

    it('should flush the channel once all values are taken', async () => {
      const ch = new Channel()
      ch.tail(1)
      ch.tail(2)
      const take1 = ch.take()
      const take2 = ch.take()
      const take3 = ch.take()
      ch.close()
      await ch.done()
      const [val1, val2, val3] = await Promise.all([take1, take2, take3])
      assert.deepEqual(ch.state, STATES.ENDED)
      assert.deepEqual(val1, 1)
      assert.deepEqual(val2, 2)
      assert.deepEqual(val3, Channel.DONE)
    })
  })

  describe('#close()', () => {
    it('should close a non-empty channel', async () => {
      const ch = new Channel()
      ch.put(1)
      assert.deepEqual(ch.state, STATES.OPEN)
      ch.close()
      assert.deepEqual(ch.state, STATES.CLOSED)
    })

    it('should end an empty channel', async () => {
      const ch = new Channel()
      assert.deepEqual(ch.state, STATES.OPEN)
      ch.close()
      await ch.done()
      assert.deepEqual(ch.state, STATES.ENDED)
    })

    it('should swap from closed to ended on closed channel emptied', async () => {
      const ch = new Channel()
      assert.deepEqual(ch.state, STATES.OPEN)
      ch.put(1)
      assert.deepEqual(ch.state, STATES.OPEN)
      ch.close()
      assert.deepEqual(ch.state, STATES.CLOSED)
      await ch.take()
      await ch.done()
      assert.deepEqual(ch.state, STATES.ENDED)
    })
  })

  describe('#done()', () => {
    it('should return a promise', async () => {
      const ch = new Channel()
      const d = ch.done()
      assert.instanceOf(d, Promise)
    })

    it('should resolve when the channel is ended', async () => {
      const ch = new Channel()
      const d = ch.done()
      assert.deepEqual(ch.state, STATES.OPEN)
      ch.close()
      await d
      assert.deepEqual(ch.state, STATES.ENDED)
    })

    it('should resolve all promises when the channel is ended', async () => {
      const ch = new Channel()
      const [d1, d2, d3] = [ch.done(), ch.done(), ch.done()]
      assert.deepEqual(ch.state, STATES.OPEN)
      ch.close()
      await Promise.all([d1, d2, d3])
      assert.deepEqual(ch.state, STATES.ENDED)
    })
  })

  describe('#pipe()', () => {
    it('should pipe values from one channel to another channel', async () => {
      const ch1 = new Channel()
      const ch2 = new Channel()
      ch1.pipe(ch2)
      await ch1.put(1)
      assert.deepEqual(await ch2.take(), 1)
      assert.deepEqual(ch1.pipeline, [ch2])
      assert.strictEqual(ch2.pipeline.length, 0)
      assert.isOk(ch1.empty())
      assert.isOk(ch2.empty())
    })

    it('should pipe values through multiple chained pipes', async () => {
      const ch1 = new Channel()
      const ch2 = new Channel()
      const ch3 = new Channel()
      ch1.pipe(ch2).pipe(ch3)
      ch1.put(1)
      ch1.put(2)
      const take1 = await ch3.take()
      const take2 = await ch3.take()
      assert.deepEqual(take1, 1)
      assert.deepEqual(take2, 2)
      assert.isOk(ch1.empty())
      assert.isOk(ch2.empty())
      assert.isOk(ch3.empty())
    })

    it('can pipe from one channel split to multiple channels', async () => {
      const ch1 = new Channel()
      const ch2 = new Channel()
      const ch3 = new Channel()
      ch1.pipe(ch2, ch3)
      ch1.put(1)
      ch1.put(2)

      const take1From2 = await ch2.take()
      assert.deepEqual(1, take1From2)

      const take1From3 = await ch3.take()
      assert.deepEqual(1, take1From3)

      const take2From2 = await ch2.take()
      assert.deepEqual(2, take2From2)

      const take2From3 = await ch3.take()
      assert.deepEqual(2, take2From3)

      assert.isOk(ch1.empty())
      assert.isOk(ch2.empty())
      assert.isOk(ch3.empty())
    })

    it('should return a reference to the last channel in the pipe', async () => {
      const ch1 = new Channel()
      const ch2 = new Channel()
      const ref = ch1.pipe(ch2)
      assert.deepEqual(ref, ch2)
    })

    it('should execute any available transforms in the pipeline', async () => {
      const ch1 = new Channel(8, x => x + 2)
      const ch2 = new Channel(8, x => ({ x }))
      const ch3 = new Channel(8, x => ({ y: x.x }))
      ch1.pipe(ch2).pipe(ch3)
      for (let i = 0; i < 5; i++) ch1.put(i)
      for (let i = 0; i < 5; i++)
        assert.deepEqual(await ch3.take(), { y: i + 2 })
    })

    it('should accept transforms and turn them into channels', async () => {
      const ch1 = new Channel(x => x + 2)
      const ch3 = ch1.pipe(x => ({ x })).pipe(x => ({ y: x.x }))
      for (let i = 0; i < 5; i++) ch1.put(i)
      for (let i = 0; i < 5; i++)
        assert.deepEqual(await ch3.take(), { y: i + 2 })
    })

    it('should be able to put values onto any channel in the pipeline', async () => {
      const ch1 = new Channel()
      const ch2 = new Channel()
      const ch3 = new Channel()
      ch1.pipe(ch2).pipe(ch3)
      await ch2.put(2)
      assert.deepEqual(await ch3.take(), 2)
      ch3.put(3)
      assert.deepEqual(await ch3.take(), 3)
      assert.isOk(ch1.empty())
      assert.isOk(ch2.empty())
      assert.isOk(ch3.empty())
    })

    it('should pipe values which were already buffered', async () => {
      const ch1 = new Channel(4)
      const ch2 = new Channel(4)
      for (let i = 0; i < 4; i++) await ch1.put(i)
      ch1.pipe(ch2)
      for (let i = 0; i < 4; i++) assert.deepEqual(await ch2.take(), i)
    })

    it('should block pipes when backed up', async () => {
      const ch1 = new Channel(2)
      const ch2 = new Channel(2)
      const ch3 = new Channel(4)
      ch1.pipe(ch2, ch3)
      await ch1.put(1)
      await ch1.put(2)
      ch1.put(3)
      ch1.put(4)

      // give the pipe time to transfer values from ch1 to ch2 and ch3
      await timeout()

      // ch1 should not be empty already, but the 3rd value will be taken off the buffer
      // and will be hanging out in a hidden context waiting to be resolved on all pipes
      // the 4th value should remain on the buffer until the pipe is unblocked
      assert.isNotOk(ch1.empty())
      assert.deepEqual(ch1.buf.length, 1)
      assert.strictEqual(ch1.puts.length, 0)
      assert.strictEqual(ch1.takes.length, 0)

      // the 3rd value will not be placed on the 2nd channel, since the max size of ch2 is 2
      assert.isNotOk(ch2.empty())
      assert.deepEqual(ch2.buf.length, 2)
      assert.deepEqual(ch2.puts.length, 1)
      assert.strictEqual(ch2.takes.length, 0)

      // the 3rd value will be placed on the 3rd channel, since the max size of ch3 is 4
      assert.isNotOk(ch3.empty())
      assert.deepEqual(ch3.buf.length, 3)
      assert.strictEqual(ch3.puts.length, 0)
      assert.strictEqual(ch3.takes.length, 0)

      let take3 = await ch3.take()

      // ch1 should be unchanged, since the pipe is still blocked
      assert.isNotOk(ch1.empty())
      assert.deepEqual(ch1.buf.length, 1)
      assert.strictEqual(ch1.puts.length, 0)
      assert.strictEqual(ch1.takes.length, 0)

      // ch2 should be unchanged, still blocking the pipe
      assert.isNotOk(ch2.empty())
      assert.deepEqual(ch2.buf.length, 2)
      assert.deepEqual(ch2.puts.length, 1)
      assert.strictEqual(ch2.takes.length, 0)

      // ch3 should have a value removed from its buffer
      assert.isNotOk(ch3.empty())
      assert.deepEqual(ch3.buf.length, 2)
      assert.strictEqual(ch3.puts.length, 0)
      assert.strictEqual(ch3.takes.length, 0)
      assert.deepEqual(take3, 1)

      let take2 = await ch2.take()
      await timeout() // to ensure the next value is fully pulled from the ch1 before we continue, now that takes will resolve interleaved with async puts

      // ch1 should have had its last value taken
      assert.isOk(ch1.empty())
      assert.strictEqual(ch1.buf.length, 0)
      assert.strictEqual(ch1.puts.length, 0)
      assert.strictEqual(ch1.takes.length, 0)

      // ch2 should have unblocked space for 1 value, then reblocked ch1 from putting again
      assert.isNotOk(ch2.empty())
      assert.deepEqual(take2, 1)
      assert.deepEqual(ch2.buf.length, 2)
      assert.deepEqual(ch2.puts.length, 1)
      assert.strictEqual(ch2.takes.length, 0)

      // ch3 should have the next value from ch1 placed on its buffer
      assert.isNotOk(ch3.empty())
      assert.deepEqual(ch3.buf.length, 3)
      assert.strictEqual(ch3.puts.length, 0)
      assert.strictEqual(ch3.takes.length, 0)
      ;[take2, take3] = await Promise.all([ch2.take(), ch3.take()])
      await timeout() // same as above. ensure that the async put has time to place values from ch1 onto ch2 and ch3 after the takes are successful

      // ch2 should have accepted the last value from ch1
      assert.deepEqual(take2, 2)
      assert.isNotOk(ch2.empty())
      assert.deepEqual(ch2.buf.length, 2)
      assert.strictEqual(ch2.puts.length, 0)
      assert.strictEqual(ch2.takes.length, 0)

      // ch3 should have another value taken
      assert.deepEqual(take3, 2)
      assert.isNotOk(ch3.empty())
      assert.deepEqual(ch3.buf.length, 2)
      assert.strictEqual(ch3.puts.length, 0)
      assert.strictEqual(ch3.takes.length, 0)
    })

    it('should be able to close single channels', async () => {
      const ch1 = new Channel(4)
      const ch2 = new Channel(4)
      for (let i = 0; i < 4; i++) await ch1.put(i)
      ch1.close()
      ch1.pipe(ch2)
      await ch1.done()
      assert.deepEqual(ch1.state, STATES.ENDED)
      assert.deepEqual(ch2.state, STATES.OPEN)
    })

    it('should be able to close the entire pipeline by flag', async () => {
      const ch1 = new Channel()
      const ch2 = new Channel()
      const ch3 = new Channel()
      const ch4 = new Channel()
      ch1
        .pipe(ch2)
        .pipe(ch3)
        .pipe(ch4)
      for (let i = 0; i < 8; i++) {
        ch1.put(i) // if we await this and the cap is >= 4, then we freeze? wtf?
      }
      ch1.close(true)
      for (let i = 0; i < 8; i++) assert.deepEqual(await ch4.take(), i)
      await ch4.done()
      assert.deepEqual(ch1.state, STATES.ENDED)
      assert.deepEqual(ch2.state, STATES.ENDED)
      assert.deepEqual(ch3.state, STATES.ENDED)
      assert.deepEqual(ch4.state, STATES.ENDED)
    })
  })

  describe('.pipeline()', () => {
    it('should create a pipeline from an iterable of callbacks', async () => {
      const [ch1, ch3] = Channel.pipeline(x => x + 2, x => x ** 2, x => x / 2)
      assert.deepEqual(ch1.pipeline.length, 1) // since ch1 -> ch2 only
      const ch2 = ch1.pipeline[0]
      assert.deepEqual(ch2.pipeline.length, 1)
      assert.deepEqual(ch2.pipeline[0], ch3)
      ch1.put(1)
      ch1.put(2)
      ch1.put(3)
      ch1.close(true)
      assert.deepEqual(await ch3.take(), 4.5)
      assert.deepEqual(await ch3.take(), 8)
      assert.deepEqual(await ch3.take(), 12.5)
      await ch1.done()
      await ch2.done()
      await ch3.done()
      assert.deepEqual(ch1.state, STATES.ENDED)
      assert.deepEqual(ch2.state, STATES.ENDED)
      assert.deepEqual(ch3.state, STATES.ENDED)
    })

    it('should accept a mix of channels and callbacks', async () => {
      const [ch1, ch3] = Channel.pipeline(
        x => x + 2,
        new Channel(x => x ** 2),
        x => x / 2,
      )
      assert.deepEqual(ch1.pipeline.length, 1) // since ch1 -> ch2 only
      const ch2 = ch1.pipeline[0]
      assert.deepEqual(ch2.pipeline.length, 1)
      assert.deepEqual(ch2.pipeline[0], ch3)
      ch1.put(1)
      ch1.put(2)
      ch1.put(3)
      ch1.close(true)
      assert.deepEqual(await ch3.take(), 4.5)
      assert.deepEqual(await ch3.take(), 8)
      assert.deepEqual(await ch3.take(), 12.5)
      await ch1.done()
      await ch2.done()
      await ch3.done()
      assert.deepEqual(ch1.state, STATES.ENDED)
      assert.deepEqual(ch2.state, STATES.ENDED)
      assert.deepEqual(ch3.state, STATES.ENDED)
    })
  })

  describe('#unpipe()', () => {
    it('should remove a channel from a pipeline', async () => {
      const ch1 = new Channel(2)
      const ch2 = new Channel(2)
      ch1.pipe(ch2)
      assert.deepEqual(ch1.pipeline, [ch2])
      ch1.unpipe(ch2)
      assert.deepEqual(ch1.pipeline, [])
    })

    it('should return a reference to an existing channel', async () => {
      const ch1 = new Channel()
      const ch2 = new Channel()
      ch1.pipe(ch2)
      const unpiped = ch1.unpipe(ch2)
      assert.deepEqual(ch1, unpiped)
    })

    it('should stop the automated flow of data', async () => {
      const ch1 = new Channel(2)
      const ch2 = ch1.pipe(new Channel(2))
      await ch1.put(1)
      await ch1.put(2)
      ch1.put(3)
      ch1.put(4)
      await timeout()
      ch1.unpipe(ch2)
      assert.deepEqual(await ch2.take(), 1)
      assert.deepEqual(await ch2.take(), 2)

      assert.isNotOk(ch2.empty())
      // note this - since 3 is already queued up in ch2.puts,
      // it will STILL be received inside channel 2
      // is this intended behavior? unexpected? bug to be fixed?
      // as of right now, i feel this is intended and OK.
      assert.deepEqual(await ch2.take(), 3)
      assert.isOk(ch2.empty())
      assert.strictEqual(ch2.takes.length, 0)

      assert.isNotOk(ch1.empty())
      assert.deepEqual(await ch1.take(), 4)
      assert.isOk(ch1.empty())
      assert.strictEqual(ch1.takes.length, 0)
    })

    it('should keep child pipes intact', async () => {
      const ch1 = new Channel(2)
      const ch2 = new Channel(2)
      const ch3 = new Channel(2)
      ch1.pipe(ch2).pipe(ch3)
      assert.deepEqual(ch1.pipeline, [ch2])
      assert.deepEqual(ch2.pipeline, [ch3])
      await ch1.put(1)
      await ch1.put(2)
      assert.deepEqual(await ch3.take(), 1)
      assert.deepEqual(await ch3.take(), 2)
      ch1.unpipe(ch2)
      assert.deepEqual(ch1.pipeline, [])
      assert.deepEqual(ch2.pipeline, [ch3])
      await ch2.put(3)
      await ch2.put(4)
      assert.deepEqual(await ch3.take(), 3)
      assert.deepEqual(await ch3.take(), 4)
    })

    it('should keep sibling pipes intact', async () => {
      const ch1 = new Channel(4)
      const ch2 = new Channel(2)
      const ch3 = new Channel(2)

      ch1.pipe(ch2, ch3)
      assert.deepEqual(ch1.pipeline, [ch2, ch3])
      await ch1.put(1)
      await ch1.put(2)
      await timeout() // make sure the puts are through before unpipe

      ch1.unpipe(ch2)
      assert.deepEqual(ch1.pipeline, [ch3])

      await ch1.put(3)
      await ch1.put(4)
      assert.deepEqual(await ch2.take(), 1)
      assert.deepEqual(await ch2.take(), 2)
      assert.isOk(ch2.empty())
      assert.strictEqual(ch2.takes.length, 0)

      assert.deepEqual(await ch3.take(), 1)
      assert.deepEqual(await ch3.take(), 2)
      assert.deepEqual(await ch3.take(), 3)
      assert.deepEqual(await ch3.take(), 4)
      assert.isOk(ch3.empty())
      assert.strictEqual(ch3.takes.length, 0)

      assert.isOk(ch1.empty())
      assert.deepEqual(ch1.takes.length, 1) // ch3 should still have a take registered with c1
    })
  })

  describe('#merge()', () => {
    it('should put values from multiple channels onto a new channel', async () => {
      const ch1 = new Channel()
      const ch2 = new Channel()

      const ch3 = ch1.merge(ch2) // or Channel.merge(ch1, ch2)
      await ch1.put(1)
      await ch2.put(2)
      assert.deepEqual(await ch3.take(), 1)
      assert.deepEqual(await ch3.take(), 2)
    })
  })

  describe('#produce()', () => {
    it('should automatically produce values when space is available', async () => {
      const ch = new Channel()
      let counter = 0
      ch.produce(() => counter++)
      for (let i = 0; i < 10; i++) assert.deepEqual(await ch.take(), i)
      ch.close()
      await ch.done()
    })

    it('can produce values synchronously', async () => {
      const ch = new Channel()
      ch.produce(Math.random)
      for (let i = 0; i < 10; i++) {
        const val = await ch.take()
        assert.isOk(val >= 0 && val < 1)
      }
      ch.close()
      await ch.done()
    })

    it('can produce values asynchronously', async () => {
      const ch = new Channel()
      let counter = 0
      ch.produce(async () => {
        await timeout()
        return counter++
      })
      for (let i = 0; i < 10; i++) assert.deepEqual(await ch.take(), i)
      ch.close()
      await ch.done()
    })
  })

  describe('#consume()', () => {
    it('can consume values synchronously', async () => {
      const ch = new Channel()
      let counter = 0
      ch.consume(x => {
        counter += x
      })
      await ch.put(1)
      await ch.put(2)
      await ch.put(3)
      await ch.put(4)
      await ch.put(5)
      ch.close()
      await ch.done()
      assert.deepEqual(counter, 15)
    })

    it('can consume values asynchronously', async () => {
      const ch = new Channel(async x => x)
      let counter = 0
      ch.consume(async x => {
        await timeout()
        counter += x
      })
      await ch.put(1)
      await ch.put(2)
      await ch.put(3)
      await ch.put(4)
      await ch.put(5)
      ch.close()
      await ch.done()
      assert.deepEqual(counter, 15)
    })

    it('should consume all values even if put without waiting', async () => {
      const ch = new Channel(async x => {
        await timeout()
        return x
      })
      const arr = []
      ch.consume(x => {
        arr.push(x)
      })
      ch.put(1)
      ch.put(2)
      ch.put(3)
      ch.put(4)
      ch.put(5)
      ch.put(6)
      ch.put(7)
      ch.put(8)
      ch.close()
      await ch.done()
      assert.deepEqual(arr, [1, 2, 3, 4, 5, 6, 7, 8])
    })
  })

  describe('transform', () => {
    it('should transform values', async () => {
      const ch = new Channel(x => x ** 2)
      for (let i = 1; i <= 4; i++) ch.put(i)
      for (let i = 0; i < 4; i++)
        assert.deepEqual(await ch.take(), (i + 1) ** 2)
    })

    it('should drop undefined values', async () => {
      const ch = new Channel(x => {
        if (x > 2) return x
      })
      ch.put(1)
      ch.put(2)
      ch.put(3)
      ch.put(4)
      assert.deepEqual(await ch.take(), 3)
      assert.deepEqual(await ch.take(), 4)
      assert.strictEqual(ch.length, 0)
    })

    it('should transform values by callback', async () => {
      const ch = new Channel((x, push) => {
        if (x > 2) push(x)
      })
      ch.put(1)
      ch.put(2)
      ch.put(3)
      ch.put(4)
      assert.deepEqual(await ch.take(), 3)
      assert.deepEqual(await ch.take(), 4)
      assert.strictEqual(ch.length, 0)
    })

    it('should expand values by multiple callback executions', async () => {
      const ch = new Channel((x, push) => {
        if (x > 2) {
          push(x)
          push(x)
        }
      })
      ch.put(1)
      ch.put(2)
      ch.put(3)
      ch.put(4)
      assert.deepEqual(await ch.take(), 3)
      assert.deepEqual(await ch.take(), 3)
      assert.deepEqual(await ch.take(), 4)
      assert.deepEqual(await ch.take(), 4)
      assert.strictEqual(ch.length, 0)
    })

    it('should maintain order with multiple callback transforms', async () => {
      const ch = new Channel(8, (x, push) => {
        if (x < 3) {
          push(x)
          push(x * 2)
          push(x * 3)
        } else push(x)
      })
      const arr = []
      ch.consume(async x => {
        arr.push(x)
      })
      await ch.put(1)
      await ch.put(2)
      await ch.put(3)
      await ch.put(4)
      await ch.put(5)
      await ch.put(6)
      ch.close()
      await ch.done()
      assert.deepEqual(arr, [1, 2, 3, 2, 4, 6, 3, 4, 5, 6])
    })

    it('should transform values asynchronously when promise is returned', async () => {
      const ch = new Channel(async (val, push) => {
        await timeout(5)
        push(val)
        await timeout(5)
        push(val + 2)
      })

      const arr = []
      ch.consume(x => arr.push(x))
      await ch.put(1)
      await ch.put(2)
      ch.close()
      await ch.done()
      assert.deepEqual(arr, [1, 3, 2, 4])
    })

    it('should transform values asynchronously when 3 parameters are used', async () => {
      const ch = new Channel((val, push, done) => {
        setTimeout(() => {
          push(val)
          setTimeout(() => {
            push(val + 2)
            done()
          }, 5)
        }, 5)
      })
      const arr = []
      ch.consume(x => arr.push(x))
      await ch.put(1)
      await ch.put(2)
      ch.close()
      await ch.done()
      assert.deepEqual(arr, [1, 3, 2, 4])
    })
  })

  describe('general use', () => {
    it('should not block indefinitely with synchronous produce + consume', async () => {
      const ch = new Channel()
      ch.produce(Math.random)
      ch.consume(x => x ** 2)
      await timeout(50) // let it spin for a while
      ch.close() // close, and continue spinning until empty
      await ch.done()
      assert.isOk(ch.empty())
      assert.deepEqual(ch.state, STATES.ENDED)
    })

    it('should work with DroppingBuffer', async () => {
      const buf = new DroppingBuffer()
      const transformer = (x, push) => {
        push(x)
        push(x + 1)
      }
      const ch = new Channel(buf, transformer)
      const values = [1, 2, 3, 4, 5]
      for (const val of values) await ch.put(val) // note that we aren't blocked, even while awaiting.
      assert.deepEqual(buf.full(), false)
      await timeout(10)
      const val = await ch.take()
      assert.deepEqual(val, 1)
      assert.deepEqual(buf.full(), false)
    })

    it('should work with a SlidingBuffer', async () => {
      const buf1 = new SlidingBuffer(1)
      const ch1 = new Channel(buf1)
      const vals = [1, 2, 3, 4]
      for (const val of vals) await ch1.put(val)
      assert.deepEqual(await ch1.take(), 4)

      const buf2 = new SlidingBuffer(2)
      const ch2 = new Channel(buf2)
      await ch2.put(1)
      await ch2.put(2)
      await ch2.put(3)
      await ch2.put(4)
      assert.deepEqual(await ch2.take(), 3)
      await ch2.put(5)
      assert.deepEqual(await ch2.take(), 4)
      assert.deepEqual(await ch2.take(), 5)
      await ch2.put(6)
      await ch2.put(7)
      await ch2.put(8)
      assert.deepEqual(await ch2.take(), 7)
      assert.deepEqual(await ch2.take(), 8)
    })
  })
})
