import fs from 'fs';
import Channel, {timeout} from '../../dist/channel.js';
let log = console.log.bind(console);

import text from './text.js';

function isAlphanumeric(char) {
    if (!(char instanceof Number))
        char = char.charCodeAt(0);
    if (char > 47 && char < 58)
        return true;
    if (char > 64 && char < 91)
        return true;
    if (char > 96 && char < 123)
        return true;
    return false;
}

export async function run() {
    try {
        let start = new Date().getTime();
        let lines = new Channel((text, accept) => {
            for (let line of text.split('\n'))
                accept(line);
        });

        let sentences = new Channel((line, accept) => {
            for (let sentence of line.split('.'))
                accept(sentence);
        });

        let words = new Channel((sentence, accept) => {
            for (let word of sentence.split(' '))
                accept(word);
        });

        let chars = new Channel((word, accept) => {
            for (let char of word.split('').filter(isAlphanumeric).map(x => x.toLowerCase()))
                accept(char);
        });

        let charset = {};
        chars.consume(char => {
            if (!charset[char])
                charset[char] = 0;
            charset[char]++;
        });

        lines.pipe(sentences)
            .pipe(words)
            .pipe(chars);

        log('Parsing text from ./text.js and counting alphanumeric characters...');
        await lines.put(text);
        lines.close(true);
        await chars.done();
        
        let sorted = Object.entries(charset).sort((a, b) => {
            return a[1] > b[1] ? -1 : a[1] < b[1] ? 1 : 0;
        });
        log('Character counts were:');
        log(sorted);
        let end = new Date().getTime();
        log(`Counting characters took ${end - start}ms`);
    }
    catch(e) {
        log('error!', e);
    }
}
