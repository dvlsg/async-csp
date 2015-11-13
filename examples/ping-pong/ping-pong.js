/* eslint-disable no-constant-condition */

"use strict";

import Channel, { timeout } from '../../dist/channel.js';
let log = console.log.bind(console);

class Ball {
    constructor(hits: Number = 0) {
        this.hits = hits;
    }
}

async function player(name: String, table: Channel) {
    while (true) {
        let ball = await table.take();
        if (ball === Channel.DONE)
            break;
        ball.hits++;
        log(`${name}! Hits: ${ball.hits}`);
        await timeout(100);
        await table.put(ball);
    }
}

export async function run() {
    log('Opening ping-pong channel!');
    let table = new Channel();
    player('ping', table);
    player('pong', table);
    log('Serving ball...');
    let ball = new Ball();
    await table.put(ball);
    await timeout(1000);
    log('Closing ping-pong channel...');
    table.close();
    await table.done();
    log('Channel is fully closed!');
    log(`Ball was hit ${ball.hits} times!`);
}
