import fs from 'fs';
import Channel, {timeout} from '../../dist/channel.js';
let log = console.log.bind(console);

import originalText from './text.js';

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
    let chText      = new Channel();
    let chLines     = new Channel();
    let chSentences = new Channel();
    let chWords     = new Channel();
    let chChars     = new Channel();
    let charset     = {};

    chText.consume(async text => {
        for (let line of text.split('\n'))
            await chLines.put(line);
    });

    chLines.consume(async line => {
        for (let sentence of line.split('.'))
            await chSentences.put(sentence);
    });

    // split sentences into words, pass to chWords
    // whenever a sentence is placed on chSentences
    chSentences.consume(async sentence => {
        for (let word of sentence.split(' '))
            await chWords.put(word);
    });

    // split words into chars, pass to chChars
    // whenever a word is placed on chWords
    chWords.consume(async word => {
        let chars = word
            .split('')
            .filter(isAlphanumeric)
            .map(x => x.toLowerCase());
        for (let char of chars)
            await chChars.put(char);
    });

    // take chars and add them to a running counter
    // whenever a char is placed chChars
    chChars.consume(async char => {
        if (!charset[char])
            charset[char] = 0;
        charset[char]++;
    });

    // kick it all off!
    // to be explicit, manually wait for dones,
    // then close the next channel in line
    await chText.put(originalText);
    chText.close();
    await chText.done();
    chLines.close();
    await chLines.done();
    chSentences.close();
    await chSentences.done();
    chWords.close();
    await chWords.done();
    chSentences.close();
    await chSentences.done();
    let chars = Object.entries(charset);
    chars.sort((a, b) => {
        return a[1] > b[1] ? -1 : a[1] < b[1] ? 1 : 0;
    });
    log(chars);
}
