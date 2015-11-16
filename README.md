# async-csp
Communicating sequential processes designed to be used with async/await.

```js
import Channel, { timeout } from 'async-csp';

async function puts(channel) {
    for (let i = 0; i < 5; i++) {
        await timeout(1000);
        await channel.put(i);
    }
}

async function takes(channel) {
    for (let i = 0; i < 5; i++) {
        let val = await channel.take();
        console.log('val:', val);
    }
}

// create a new csp channel
let channel = new Channel();

// places a value onto the channel once every second
puts(channel);

// logs values from the channel as soon as they are available
takes(channel);

// console logs, once a second
//=> 0
//=> 1
//=> 2
//=> 3
//=> 4
```

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

If you would like to jump straight into examples, they can be found [here](examples/).
To run any example, make sure the default task has been successfully run once (especially `npm install`), then run `node index.js` from the root folder of the example.
I would suggest starting with [ping-pong](examples/ping-pong).

## Usage

*Note: All of the code pieces below are assumed to be executed from an `async` context, so `await` is available at the base level. To read more about these methods, see [this proposal](https://github.com/lukehoban/ecmascript-asyncawait) for async/await in ES7.*

### Data Flow

A `Channel` is a container which makes use of `Promises` to handle the incoming and outgoing flow of data.

To place a value on a `Channel` you may use `Channel#put()`, and to take a value off of the channel you may use `Channel#take()`.

Note that by default, a put will not resolve until its value is taken off of the channel, and a take will not resolve until a value is made available on the channel.

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
Essentially, this means a put can resolve while space remains on the buffer, even if no take is waiting to receive a value.
As soon as the buffer becomes full, put will begin blocking again until a take clears a space from the buffer.

To create a `Channel` with a buffer size, pass in a `Number` as the first argument to the constructor.

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

puts(channel);
await timeout(1000); // this is a helper method which will resolve after the given milliseconds, used to help show the effects of blocking.
takes(channel);
```

### Non-blocking puts

A common use for a `Channel` requires that data be input from a non async context, or we simply don't want to wait for the put to resolve.
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

If a transform should take a single value and expand it into multiple values, then the `push` parameter can be used with the transform callback.

Note that when using this callback style, all values must be sent through `push`. Any value returned from the transform callback will be ignored when more than one parameter is defined.

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

The first is to use a standard async callback.

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

The second way to use an asynchronous transform is with an async callback with a parameter length of 2.
Similar to the non-async callback with a parameter length of 2, any values must be sent through `push`, and returned values will be ignored.

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

The final asynchronous transform uses three parameters with the transform callback. To signify that the asynchronous transform has completed, execute the third argument.

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

The second is to declare the transform as `async` or to return a `Promise`.

```js
let ch = new Channel(async(x, push) => {
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

One final note: Using a transform does not prevent you from simultaneously using a buffer.
To use a transform with a buffered `Channel`, pass in the buffer size as the first argument, and the transform as the second.

let ch = new Channel(2, x => x + 1);

// note that puts will be resolved while we have space on the buffer in this case
await ch.put(1);
await ch.put(3);

console.log(await ch.take()); //=> 2
console.log(await ch.take()); //=> 4

### Channel#pipe()

Similarly to `Streams`, `Channels` can be piped from one to another.

```js
let ch1 = new Channel();
let ch2 = new Channel();
let ch3 = new Channel();

ch1.pipe(ch2).pipe(ch3); // ch1 pipes to ch2, ch2 pipes to ch3

ch1.put(1);
ch1.put(2);
ch1.put(3);

console.log(await ch3.take()); //=>  1
console.log(await ch3.take()); //=>  2
console.log(await ch3.take()); //=>  3
```

A `Channel` can be piped to multiple destinations. In this case, all downstream `Channels` will receive every value from upstream.

```js
let ch1 = new Channel();
let ch2 = new Channel();
let ch3 = new Channel();

ch1.pipe(ch2, ch3); // ch1 pipes to both ch2 and ch3

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

Also take note that if one downstream `Channel` is blocked from a currently unresolved `Channel#put()` (buffered or non-buffered), then the *entire* pipe will be blocked.
In the example above, an attempt to take all 3 values from `ch2` before taking any values from `ch3` would have resulted in deadlock.

Finally, any piped `Channel` will also execute an available transform. To set up a pipe of transforms, the following can be done:

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

`Channel.pipeline()` is a convenience method for creating piped channels from any number of callbacks.
Callbacks can be provided either as separate arguments, or contained in an array as the first argument.

```js
let [ chFirst, chLast ] = Channel.pipeline(
    x => x + 2,
    x => x.toString(),
    x => ({ x })
);

chFirst.put(1);
chFirst.put(2);
chFirst.put(3);

console.log(await chLast.take()); //=> { x: '3' }
console.log(await chLast.take()); //=> { x: '4' }
console.log(await chLast.take()); //=> { x: '5' }
```

### Channel#unpipe()

If, for whatever reason, you want to take a `Channel` out of an existing pipe, you may use `Channel#unpipe()`.

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

`Channel.merge()` is a convenience method for piping multiple `Channels` into a single, new `Channel`.

```js
let ch1 = new Channel();
let ch2 = new Channel();
let ch3 = ch1.merge(ch2); // alternately, let ch3 = Channel.merge(ch1, ch2)

ch1.put(1);
ch2.put(2);

console.log(await ch3.take()); //=> 1
console.log(await ch3.take()); //=> 2
```

### Channel#close()

`Channels` have 3 states: open, closed, and ended. An open `Channel` can be written to, a closed `Channel` can no longer be written to, and an ended `Channel` is both closed and empty.

To signify that a `Channel` will no longer have data written, execute `close`. Data can still be taken from the channel, even when closed, but no data can be added after that point.

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

(async() => {
    await timeout(1000);
    console.log(await ch.take()); //=> 1
    await timeout(1000);
    console.log(await ch.take()); //=> 2
})();

await ch.done(); // will not resolve until the async IIFE takes both values from the channel
```

### Channel#tail()

While appending to a `Channel` can technically be accomplished through the use of a shared transform and executing the transform after the `Channel` has been marked as done, sometimes transforms are not being used or the data to be appended is not available at the time the `Channel` has completed.
In these scenarios, `Channel#tail()` is provided as a method which will provide values to any `Channel#take()` only after the `Channel` is closed and all existing `Channel#put()`s have been resolved.

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

### Channel#consume()

If you would like to execute a callback as soon as values can be taken from the `Channel`, you may add a consumer by using `Channel#consume()`.

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

`Channel#consume()` can also be handled asynchronously, and will not attempt to queue up another `Channel#take()` until the consumer callback has completed running.

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

Similar to `Channel#consume()`, `Channel#produce()` will put returned values onto the `Channel` as soon as space becomes available.

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

If you have an iterable item which you would like to convert into a `Channel`, and do not want to loop and execute `Channel#put()`, use `Channel.from()` to construct the `Channel` for you.

```js
let arr = [ 1, 2, 3 ];
let ch = Channel.from(arr);

console.log(await ch.take()); //=> 1
console.log(await ch.take()); //=> 2
console.log(await ch.take()); //=> 3
```

Note that in this case, a buffer is created with the size of the iterable, all values are placed directly onto the buffer, and the `Channel` is marked as closed, which will include any attached downstream pipes.
If you would like to keep the channel or any downstream pipes open to continue receiving puts, pass in a `true` as the second argument.

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
