# async-csp
[Communicating sequential processes](https://wikipedia.org/wiki/Communicating_sequential_processes) for use with ES2016's async/await syntax.

Here's [GoLang's ping/pong example](https://talks.golang.org/2013/advconc.slide#6) in `async-csp` flavor:

```js
import Channel from 'async-csp'

async function sleep(duration) {
    return new Promise(resolve => setTimeout(resolve, duration))
}

async function player(name, table) {
    while (true) {
        let ball = await table.take();
        if (ball === Channel.DONE) {
            console.log(`${name}: table's gone!`);
            break;
        }
        ball.hits++;
        console.log(`${name}! Hits: ${ball.hits}`);
        await sleep(100);
        await table.put(ball);
    }
}

async function pingPong() {
    console.log('Opening ping-pong channel!');
    let table = new Channel();

    player('ping', table);
    player('pong', table);

    console.log('Serving ball...');
    let ball = {hits: 0};
    await table.put(ball);
    await sleep(1000);

    console.log('Closing ping-pong channel...');
    table.close();

    await table.done();
    console.log('Channel is fully closed!');
    console.log(`Ball was hit ${ball.hits} times!`);
}

pingPong()
```

Sometimes the output of this example is

```
Opening ping-pong channel!
Serving ball...
ping! Hits: 1
pong! Hits: 2
ping! Hits: 3
pong! Hits: 4
ping! Hits: 5
pong! Hits: 6
ping! Hits: 7
pong! Hits: 8
ping! Hits: 9
Closing ping-pong channel...
pong: table's gone!
Channel is fully closed!
Ball was hit 9 times!
ping: table's gone!
```

and sometimes it's

```
Opening ping-pong channel!
Serving ball...
ping! Hits: 1
pong! Hits: 2
ping! Hits: 3
pong! Hits: 4
ping! Hits: 5
pong! Hits: 6
ping! Hits: 7
pong! Hits: 8
ping! Hits: 9
pong! Hits: 10
Closing ping-pong channel...
ping: table's gone!
Channel is fully closed!
Ball was hit 10 times!
pong: table's gone!
```

Sometimes the ball is hit 9 times, and sometimes 10! This is due to the nature of asynchronicity which is nicely depicted in this example.

## Installation

```
npm install async-csp
```

## Default Task

* Install node.js
* Clone the async-csp project
* Run `npm install`
* Run `gulp`
    * Executes tests
    * Cleans dist
    * Lints source
    * Builds source
    * Watches source and tests

## Examples

Examples can be found [here](examples/).
To run any example, make sure the default task has been successfully run once (or at least `npm install`), then run `node index.js` from the root folder of the example.

## Usage

*Note: All of the code pieces below are assumed to be executed from an `async` context, so `await` is available at the base level. To read more about these methods, see [this proposal](https://github.com/lukehoban/ecmascript-asyncawait) for async/await in ES7.*

### Data Flow

A `Channel` is a container which makes use of `Promises` to handle the incoming and outgoing flow of data.

To put a value on a `Channel` use `Channel#put()`, and to take a value from the channel use `Channel#take()`.

By default, the promise returned from `Channel#put()` will not resolve until its value is taken from the channel, and the promise returned from `Channel#take()` will not resolve until a value can be taken from the channel.

```js
import Channel from 'async-csp';

let channel = new Channel();

async function puts(ch) {
    await ch.put(1); // resolves when the first ch.take() is executed
    await ch.put(2); // resolves when the second ch.take() is executed
    await ch.put(3); // resolves when the third ch.take() is executed
}

async function takes(ch) {
    console.log(await ch.take()); // resolves to 1, from the first ch.put()
    console.log(await ch.take()); // resolves to 2, from the second ch.put()
    console.log(await ch.take()); // resolves to 3, from the third ch.put()
}

puts(ch);
takes(ch);
```

### Buffering

A `Channel` can be created with a buffer for receiving puts.
Essentially, this means a put can resolve while space is available on the buffer, even if no take is waiting to receive a value.
As soon as the buffer becomes full, put will begin blocking again until a take clears a space from the buffer.

To create a `Channel` with a buffer, pass in a `Number` as the first argument to the constructor.

```js
import Channel, { timeout } from 'async-csp';

let channel = new Channel(2); // buffer size of 2

async function puts(ch) {
    await ch.put(1); //=> this can resolve immediately, taking one space on the buffer
    console.log('after put 1'); // fires immediately
    await ch.put(2); //=> this can also resolve immediately, taking the second space on the buffer
    console.log('after put 2'); // also fires immediately
    await ch.put(3); //=> buffer is full! this will block until another process takes a value from the Channel
    console.log('after put 3'); // fires after the unblock!
}

async function takes(ch) {
    console.log(await ch.take()); //=> resolves to 1, clears a space on the buffer and allows the blocked ch.put(3) to also resolve
    console.log(await ch.take()); //=> resolves to 2
    console.log(await ch.take()); //=> resolves to 3
}

// execute the puts right away
puts(channel);

// use a helper method to wait for 1 second
// to help show the effects of blocking
await timeout(1000);

// after 1 second, start executing takes
takes(channel);
```

### Non-blocking puts

A common use for a `Channel` requires data to be input from a non async context, or without waiting for the put to resolve.

In this scenario, do not await the result of `Channel#put()`.

```js
let ch = new Channel();

// non-blocking puts, don't use `await`
ch.put(1);
ch.put(2);
ch.put(3);

console.log(await ch.take()); //=> 1
console.log(await ch.take()); //=> 2
console.log(await ch.take()); //=> 3
```

### Transforming

When constructing a `Channel`, you can pass in a callback to transform values as they are taken.

```js
let ch = new Channel(x => x * 2);

ch.put(1);
ch.put(2);
ch.put(3);

console.log(await ch.take()); //=> 2
console.log(await ch.take()); //=> 4
console.log(await ch.take()); //=> 6
```

If values should be dropped from the `Channel`, simply return `undefined` from the transform callback.

```js
let ch = new Channel(x => {
    if (x > 2)
        return x;
});

ch.put(1);
ch.put(1);
ch.put(3);
ch.put(4);

console.log(await ch.take()); //=> 3
console.log(await ch.take()); //=> 4
```

If a transform needs to expand a single value into multiple values, use the `push` parameter with the transform.

Note that when using this callback style, all values must be sent through `push`.
Any value returned from the transform callback will be ignored
when the provided transformer has more than one parameter defined.

```js
let ch = new Channel((x, push) => {
    push(x);
    push(x + 1);
});

ch.put(1);
ch.put(3);

console.log(await ch.take()); //=> 1
console.log(await ch.take()); //=> 2
console.log(await ch.take()); //=> 3
console.log(await ch.take()); //=> 4
```

If the transform needs to work asynchronously, there are a few ways to accomplish this.

The first is to use an async callback.

```js
let ch = new Channel(async x => {
    await timeout(100);
    return x;
});

ch.put(1);
ch.put(2);

console.log(await ch.take()); //=> 1
console.log(await ch.take()); //=> 2
```

The second way to use an asynchronous transform is by passing in an async callback with a parameter length of 2.
Similar to the non-async callback with a parameter length of 2, all values must be sent through `push`,
and returned values will be ignored.

```js
let ch = new Channel(async(x, push) => {
    await timeout(100);
    push(x);
    await timeout(100);
    push(x + 1);
});

ch.put(1);
ch.put(3);

console.log(await ch.take()); //=> 1
console.log(await ch.take()); //=> 2
console.log(await ch.take()); //=> 3
console.log(await ch.take()); //=> 4
```

The final way to use an asynchronous transform is with a three-parameter callback.
To signify that the transform has completed, execute the third argument.

```js
let ch = new Channel((x, push, done) => {
    push(x);
    setTimeout(() => {
        push(x + 1);
        done();
    }, 100);
});

ch.put(1);
ch.put(3);

console.log(await ch.take()); //=> 1
console.log(await ch.take()); //=> 2
console.log(await ch.take()); //=> 3
console.log(await ch.take()); //=> 4
```

One final note: Using a transform does not prevent you from simultaneously using a buffer.
To use a transform with a buffered `Channel`, pass in the buffer size as the first argument, and the transform as the second.

```js
let ch = new Channel(2, x => x + 1);

// note that puts will be resolved immediately, since we have space on the buffer
await ch.put(1);
await ch.put(3);

console.log(await ch.take()); //=> 2
console.log(await ch.take()); //=> 4
```

### Channel#pipe()

Similarly to `Streams`, `Channels` can be piped from one to another.

```js
let ch1 = new Channel();
let ch2 = new Channel();
let ch3 = new Channel();

ch1.pipe(ch2).pipe(ch3);
/*
    +---+
    |ch1|
    +---+
      |
      V
    +---+
    |ch2|
    +---+
      |
      V
    +---+
    |ch3|
    +---+
*/

ch1.put(1);
ch1.put(2);
ch1.put(3);

console.log(await ch3.take()); //=>  1
console.log(await ch3.take()); //=>  2
console.log(await ch3.take()); //=>  3
```

A `Channel` can be piped to multiple destinations.
In this case, downstream `Channels` will receive every value from upstream.

```js
let ch1 = new Channel();
let ch2 = new Channel();
let ch3 = new Channel();

ch1.pipe(ch2, ch3); // or `ch1.pipe(ch2); ch1.pipe(ch3);`
/*
        +---+
      +-|ch1|-+
      | +---+ |
      |       |
      V       V
    +---+   +---+
    |ch2|   |ch3|
    +---+   +---+
*/

ch1.put(1);
ch1.put(2);
ch1.put(3);

// 1 is taken from ch1 and put on ch2 and ch2

console.log(await ch2.take()); //=>  1
console.log(await ch3.take()); //=>  1

// 2 is taken from ch1 and put on ch2 and ch3

console.log(await ch2.take()); //=>  2
console.log(await ch3.take()); //=>  2

// 3 is taken from ch1 and put on ch2 and ch3

console.log(await ch2.take()); //=>  3
console.log(await ch3.take()); //=>  3
```

Typically, it is recommended to pass a `Channel` into pipe, but if you need a shortcut for creating a `Channel` from a transform callback, you may also pass in a callback directly.

```js
let ch1 = new Channel(x => x + 1);

// note that this returns a reference to the last `Channel` from `#pipe()`
let ch3 = ch1.pipe(x => x + 2).pipe(x => x + 3); 

ch1.put(1);
ch1.put(2);
ch1.put(3);

console.log(await ch3.take()); //=> 7
console.log(await ch3.take()); //=> 8
console.log(await ch3.take()); //=> 9
```

Also take note that if one downstream `Channel` is blocked from a currently unresolved `Channel#put()` (buffered or non-buffered), then the *entire* pipe will be blocked.
In the example above, an attempt to take all 3 values from `ch2` before taking any values from `ch3` would have resulted in deadlock.

Finally, any piped `Channel` will also execute transforms.

```js
let ch1 = new Channel(x => x + 2);
let ch2 = new Channel(x => x.toString());
let ch3 = new Channel(x => ({ x: x }));

ch1.pipe(ch2).pipe(ch3);

ch1.put(1);
ch1.put(2);
ch1.put(3);

console.log(await ch3.take()); //=> { x: '3' }
console.log(await ch3.take()); //=> { x: '4' }
console.log(await ch3.take()); //=> { x: '5' }
```

### Channel.pipeline()

`Channel.pipeline()` is a helper method for creating piped channels from any number of callbacks or `Channels`.
Inputs can be provided either as separate arguments, or contained in an array as the first argument. If an input is provided as a callback, it will be turned into a `Channel` using that callback as the transform.

`Channel.pipeline()` will return an array containing the first and the last `Channel` in the pipeline.

```js
let [ ch1, ch3 ] = Channel.pipeline(
    x => x + 2,
    new Channel(x => x.toString()),
    async x => ({ x })
);

ch1.put(1);
ch1.put(2);
ch1.put(3);

console.log(await ch3.take()); //=> { x: '3' }
console.log(await ch3.take()); //=> { x: '4' }
console.log(await ch3.take()); //=> { x: '5' }
```

### Channel#unpipe()

If a `Channel` should be taken out of an existing pipe, use `Channel#unpipe()`.

```js
let ch1 = new Channel();
let ch2 = new Channel();
let ch3 = new Channel();

ch1.pipe(ch2).pipe(ch3);

ch1.put(1);
console.log(await ch3.take()); //=> 1

// now take ch2 out of the pipe
ch1.unpipe(ch2);

ch1.put(2);
console.log(await ch1.take()); //=> 2, note that we took from ch1

// note that ch2 is still piping to ch3
ch2.put(3);
console.log(await ch3.take()); //=> 3
```

### Channel#merge()

`Channel.merge()` is a helper method for piping multiple `Channels` into a single, new `Channel`.

```js
let ch1 = new Channel();
let ch2 = new Channel();
let ch3 = ch1.merge(ch2); // or, `ch3 = Channel.merge(ch1, ch2)`

ch1.put(1);
ch2.put(2);

console.log(await ch3.take()); //=> 1
console.log(await ch3.take()); //=> 2
```

### Channel#close()

A `Channel` has 3 states: open, closed, and ended. An open `Channel` can be written to, a closed `Channel` will not accept any new values but may be non-empty, and an ended `Channel` is both closed and empty.

To signify that a `Channel` should be done accepting new values, execute `Channel#close()`. Data can still be taken from the channel after that point, but no more values can be added.

```js
let ch1 = new Channel();

ch1.put(1);
ch1.put(2);

ch1.close();

ch1.put(3); // resolves immediately with value of Channel.DONE

console.log(await ch1.take()); //=> 1
console.log(await ch1.take()); //=> 2
console.log(await ch1.take()); //=> Channel.DONE
```

If `Channels` are piped together, and you want the entire pipeline to close when possible, simply pass `true` as an argument to `Channel#close()`.

```js
let ch1 = new Channel();
let ch2 = new Channel();
ch1.pipe(ch2);

ch1.put(1);
ch1.put(2);

ch1.close(true);

console.log(await ch2.take()); //=> 1
console.log(await ch2.take()); //=> 2
console.log(await ch2.take()); //=> Channel.DONE
```

### Channel#done()

In order to wait for a channel to be ended (closed and empty), await the resolution of `done`.

```js
let ch = new Channel();

ch.put(1);
ch.put(2);
ch.close();

let arr = [];
(async() => {
    await timeout(1000);
    arr.push(await ch.take());
    await timeout(1000);
    arr.push(await ch.take());
})();

await ch.done(); // will not resolve until the async IIFE takes both values from the channel
console.log(arr); //=> [ 1, 2 ]
```

### Channel#tail()

While manually appending values to a `Channel` can be accomplished,
it often becomes significantly more difficult
when items such as pipes and asynchronous transforms are in play.

For simplicity, `Channel#tail()` is provided as an alternative method for
providing values to `Channel#take()` only after the `Channel` is closed
and all existing `Channel#put()`s have been resolved.

```js
let ch = new Channel();

ch.put(1);
ch.tail(4);
ch.put(2);
ch.put(3);
ch.close();

console.log(await ch.take()); //=> 1
console.log(await ch.take()); //=> 2
console.log(await ch.take()); //=> 3
console.log(await ch.take()); //=> 4
```

Note that when a `Channel` has a transform, any values provided through `Channel#tail()`
will also use that transform.

```js
let ch = new Channel(x => x + 2);

ch.put(1);
ch.tail(4);
ch.put(2);
ch.put(3);
ch.close();

console.log(await ch.take()); //=> 3
console.log(await ch.take()); //=> 4
console.log(await ch.take()); //=> 5
console.log(await ch.take()); //=> 6
```

### Channel#consume()

If you would like to execute a callback as soon as values can be taken from the `Channel`,
you may add a consumer by using `Channel#consume()`.

```js
let ch = new Channel();
ch.consume(x => {
    console.log(x);
});

await ch.put(1);
await ch.put(2);
await ch.put(3);
await ch.put(4);

// console logs
//=> 1
//=> 2
//=> 3
//=> 4
```

`Channel#consume()` can also be handled asynchronously, and will not attempt to queue up another `Channel#take()`
until the consumer callback has completed running.

```js
let ch = new Channel();
let arr = [];
ch.consume(async x => {
    await timeout(1000);
    arr.push(x);
    console.log(x);
});

await ch.put(1);
await ch.put(2);
await ch.put(3);
await ch.put(4);

// console logs, once a second
//=> 1
//=> 2
//=> 3
//=> 4
```

### Channel#produce()

Similar to `Channel#consume()`, `Channel#produce()` will put returned values
onto the `Channel` as soon as space becomes available.

```js
let ch = new Channel();
let counter = 0;
ch.produce(() => ++counter);

console.log(await ch.take()); //=> 1
console.log(await ch.take()); //=> 2
console.log(await ch.take()); //=> 3
console.log(await ch.take()); //=> 4
```

As with `Channel#consume()`, `Channel#produce()` can also work asynchronously.

```js
let ch = new Channel();
let counter = 0;
ch.produce(async() => {
    await timeout(1000);
    return ++counter;
});

console.log(await ch.take()); //=> 1, after 1 second
console.log(await ch.take()); //=> 2, after 2 seconds
console.log(await ch.take()); //=> 3, after 3 seconds
console.log(await ch.take()); //=> 4, after 4 seconds
```

### Channel.from()

If you have an iterable item which you would like to convert into a `Channel`,
use `Channel.from()` to construct a `Channel` from that iterable.

```js
let arr = [ 1, 2, 3 ];
let ch = Channel.from(arr);

console.log(await ch.take()); //=> 1
console.log(await ch.take()); //=> 2
console.log(await ch.take()); //=> 3
```

Note that in this case, a buffer is created with the size of the iterable,
all values are placed directly onto the buffer, and the `Channel` is marked as closed,
which will include any attached downstream pipes.

If the channel or any downstream pipes should remain open to continue receiving puts,
pass in a `true` as the second argument.

```js
let arr = [ 1, 2, 3 ];
let ch = Channel.from(arr, true);
ch.put(4);
ch.close();

console.log(await ch.take()); //=> 1
console.log(await ch.take()); //=> 2
console.log(await ch.take()); //=> 3
console.log(await ch.take()); //=> 4
```

## License

All code released under the [MIT](https://github.com/dvlsg/async-csp/blob/master/LICENSE) license.
