import Channel, {timeout} from '../../dist/channel.js';
let log = console.log.bind(console);

class Ball {
    constructor(hits: Number = 0) {
        this.hits = hits;
    }
}

export async function run() {
    let table = new Channel();
    player('ping', table);
    player('pong', table);
    await table.put(new Ball());
    await timeout(1000);
    table.close();
}

async function player(name: String, table: Channel) {
    while(true) {
        let ball = await table.take();
        if (ball === Channel.DONE)
            break;
        ball.hits++;
        log(`${name}! Hits: ${ball.hits}`);
        await timeout(100);
        await table.put(ball);
    }
}