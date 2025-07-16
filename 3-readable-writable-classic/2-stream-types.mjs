import { Readable, Writable, Transform } from "node:stream";

// data source: file, database, website, anything that can be consume on demand!

const readable = Readable({
    read() {
        // 1.000.000
        for (let index = 0; index < 1e6; index++) {
            const person = { id: Date.now() }
        }
        this.push(null)
    }
})

    .on('data', msg => console.log('msg', msg.toString()))