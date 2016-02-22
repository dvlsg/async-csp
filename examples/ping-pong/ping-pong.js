import Channel, { timeout } from '../../dist/channel.js';

async function player(name, table) {
    while (true) {
        let ball = await table.take();
        if (ball === Channel.DONE) {
            console.log(`${name}: table's gone!`);
            break;
        }
        ball.hits++;
        console.log(`${name}! Hits: ${ball.hits}`);
        await timeout(100);
        await table.put(ball);
    }
}

export async function run() {
    console.log('Opening ping-pong channel!');
    let table = new Channel();

    player('ping', table);
    player('pong', table);

    console.log('Serving ball...');
    let ball = { hits: 0 };
    await table.put(ball);
    await timeout(1000);

    console.log('Closing ping-pong channel...');
    table.close();

    await table.done();
    console.log('Channel is fully closed!');
    console.log(`Ball was hit ${ball.hits} times!`);
}
