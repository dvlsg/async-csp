import fs from 'fs';
import Channel, {timeout} from '../../dist/channel.js';
let log = console.log.bind(console);

let input = './read.csv';
let output = './write.sql';

export async function run() {

    let ch1 = new Channel(8, line => {
        line = line.trim();
        if (!line)
            return; // drop empty lines from the channels
        return line.split(',').map(x => x.trim());
    });

    let ch2 = new Channel(8, row => {
        return {
            id         : row[0],
            first_name : row[1],
            last_name  : row[2],
            email      : row[3],
            password   : row[4]
        };
    });

    let prepend = 'INSERT INTO people (import_id, first_name, last_name, email, password) VALUES (';
    let append = ')\n';
    let ch3 = new Channel(8, obj => {
        let out = [
            obj.id,
            `'${obj.first_name}'`,
            `'${obj.last_name}'`,
            `'${obj.email}'`,
            `'${obj.password}'`
        ];
        return prepend + out.join(', ') + append;
    });

    let fin = fs.createReadStream(input);
    let fout = fs.createWriteStream(output);

    fin.on('data', data => {
        let rows = data.toString().split('\n');
        for (let row of rows)
            ch1.put(row);
    });
    fin.on('end', () => {
        ch1.close(true); // trigger a full pipe close when read stream ends
    });
    ch3.consume(async sql => {
        if (!fout.write(sql)) {
            await new Promise(resolve => {
                fout.once('drain', resolve);
            });
        }
    });

    log(`Reading from ${input}...`);
    ch1.pipe(ch2).pipe(ch3);
    await ch3.done();
    log(`Wrote statements to ${output}!`);
}