const fs = require('fs');
const { createReadStream, createWriteStream } = require('fs');
const { Transform } = require('stream');
const { pipeline } = require('stream/promises');

const SRC = 'faceglow/assets/index-CGlQ7hi9.js';
const DST = 'faceglow/assets/index-CGlQ7hi9.js.tmp';

// Replacement pairs
const pairs = [
    {
        old: 'https://ysusifjjxpwgwfcvfhzb.supabase.co',
        new: 'https://lbxjsemcruizsxglfesw.supabase.co'
    },
    {
        old: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdXNpZmpqeHB3Z3dmY3ZmaHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NTExNzUsImV4cCI6MjA3NTEyNzE3NX0.o0dHXERah1evLec1kgfJNjFPhCq7m6_RRUkecdTL2Lc',
        new: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxieGpzZW1jcnVpenN4Z2xmZXN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjA1NDgsImV4cCI6MjA4NzQzNjU0OH0.QsJ1vIrrNALskyX3Sp2wCmHeGBXcQSDDp5qZn0zZ1OA'
    }
];

class MultiReplacer extends Transform {
    constructor(pairs) {
        super();
        this.pairs = pairs;
        this.buffer = '';
        // Max size of any "old" string
        this.maxOldLen = Math.max(...pairs.map(p => p.old.length));
    }

    _transform(chunk, enc, cb) {
        this.buffer += chunk.toString();

        // We process the buffer while keeping enough room for potential overlapping replacements
        // but here since we can't easily do it with many pairs without complexity, 
        // we'll just process the buffer but leave maxOldLen * 2 at the end
        if (this.buffer.length > this.maxOldLen * 10) {
            let segment = this.buffer.slice(0, -this.maxOldLen * 5);
            this.buffer = this.buffer.slice(-this.maxOldLen * 5);

            for (const pair of this.pairs) {
                segment = segment.split(pair.old).join(pair.new);
            }
            this.push(segment);
        }
        cb();
    }

    _flush(cb) {
        let finalPart = this.buffer;
        for (const pair of this.pairs) {
            finalPart = finalPart.split(pair.old).join(pair.new);
        }
        this.push(finalPart);
        cb();
    }
}

async function run() {
    await pipeline(
        createReadStream(SRC),
        new MultiReplacer(pairs),
        createWriteStream(DST)
    );
    fs.renameSync(DST, SRC);
    console.log('Project ID and Key patched successfully!');
}

run().catch(console.error);
