import fs from 'fs';
import Channel, {timeout} from '../../dist/channel.js';
let log = console.log.bind(console);

let input = './read.csv';
let output = './write.sql';

export async function run() {

    let makeArrays = new Channel(line => {
        line = line.trim();
        if (line) // drop empty lines from the channels
            return line.split(',').map(x => x.trim());
    });

    let makeObjects = new Channel(row => {
        return {
            id          : row[0],
            first_name  : row[1],
            last_name   : row[2],
            email       : row[3],
            password    : row[4],
            country     : row[5],
            city        : row[6],
            state       : row[7],
            address     : row[8],
            post_code   : row[9]
        };
    });

    let prepend = 'INSERT INTO people (import_id, first_name, last_name, email, password) VALUES (';
    let append = ')\n';
    let makeStatements = new Channel(8, obj => {
        let out = [
            obj.id,
            `'${obj.first_name}'`,
            `'${obj.last_name}'`,
            `'${obj.email}'`,
            `'${obj.password}'`
        ];
        return prepend + out.join(', ') + append;
    });

    log(`Reading from ${input}...`);
    let fin = fs.createReadStream(input);

    let carry = null;
    fin.on('data', data => {
        let str = data.toString();
        let lines = data.toString().split('\n');
        if (carry)
            lines[0] = carry + lines[0];
        for (let i = 0; i < lines.length - 1; i++) {
            let line = lines[i];
            makeArrays.put(line);
        }
        carry = lines[lines.length - 1];
    });
    fin.on('end', () => {
        makeArrays.close(true); // trigger a full pipe close when read stream ends
    });

    let fout = fs.createWriteStream(output);
    makeStatements.consume(async sql => {
        if (!fout.write(sql)) {
            await new Promise(resolve => {
                fout.once('drain', resolve);
            });
        }
    });

    makeArrays.pipe(makeObjects).pipe(makeStatements);
    await makeStatements.done();
    log(`Wrote statements to ${output}!`);
}