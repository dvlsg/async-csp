const { assert } = require('chai')

const { default: Channel } = require('../src/channel')

const double = x => x * 2
const identity = x => x
const addOne = x => x + 1

describe('#map()', () => {
  it('should return a separate channel', async () => {
    const ch = Channel.from([])
    const mapped = ch.map(identity)
    assert.notStrictEqual(ch, mapped)
  })

  it('should map values from one to the next', async () => {
    const input = [1, 2, 3, 4, 5]
    const ch = Channel.from(input)
    const actual = await ch.map(double).toArray()
    const expected = input.map(double)
    assert.deepEqual(actual, expected)
  })

  // u.map(a => a) is equivalent to u (identity)
  it('should satisfy identity', async () => {
    const list = [1, 2, 3, 4, 5]
    const a = await Channel.from(list).toArray()
    const b = await Channel.from(list)
      .map(identity)
      .toArray()
    assert.deepEqual(a, b)
  })

  // u.map(x => f(g(x))) is equivalent to u.map(g).map(f) (composition)
  it('should satisfy composition', async () => {
    const list = [1, 2, 3, 4, 5]
    const u1 = await Channel.from(list)
    const u2 = await Channel.from(list)

    const f = addOne
    const g = double
    const a = await u1.map(x => f(g(x))).toArray()
    const b = await u2
      .map(g)
      .map(f)
      .toArray()

    assert.deepEqual(a, b)
  })
})
