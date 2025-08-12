import { randomUUID } from "node:crypto";
import { Readable, Writable, Transform } from "node:stream";
import { createWriteStream } from "node:fs";

// data source: file, database, website, anything that can be consume on demand!

const readable = Readable({
    read() {
        // 1.000.000
        for (let index = 0; index < 1e6; index++) {
            const person = { id: randomUUID(), name: `Erik-${index}` }
            const data = JSON.stringify(person)
            this.push(data)
        }
        this.push(null)
    }
})

const mapFields = Transform({
    transform(chunk, enc, callback) {
        const data = JSON.parse(chunk)
        const result = `${data.id}, ${data.name.toUpperCase()}\n`
        callback(null, result)
    }
})

const mapHeaders = Transform({
    transform(chunk, enc, callback) {
        this.counter = this.counter ?? 0;
        if (this.counter) {
            return callback(null, chunk)
        }
        this.counter += 1
        callback(null, 'id,name\n'.concat(chunk))
    }
})
const pipeline = readable
    .pipe(mapFields)
    .pipe(mapHeaders)
    .pipe(createWriteStream('my.csv'))


pipeline.on('end', () => {
    console.log('Pipeline finished successfully')
})

// writable is always the output -> print smth, save, ignore, send email, send to other streams, etc.
// .pipe(process.stdout)