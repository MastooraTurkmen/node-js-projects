// node -e "process.stdout.write('hello world'.repeat(1e7))" > big.file

import { createServer, get } from 'node:http';
import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { setTimeout } from 'node:timers/promises';
import { PassThrough } from 'node:stream';
import { CallTracker, deepStrictEqual } from 'node:assert';

const file = createReadStream('./big.file')
const fileStream = createReadStream('./big.file')

createServer((request, response) => {
    console.log('connection received from api 01')
    // can consume partially stream
    file.pipe(response)
}).listen(3000, () => console.log('Server is running on 3000'));


createServer(async (request, response) => {
    console.log('connection received from api 02')

    await pipeline(
        fileStream,
        response
    )

    file.pipe(response)
}).listen(3001, () => console.log('Server is running on 3001'));


// ---------

await setTimeout(500)

const getHttpStream = (url) => new Promise((resolve) => {
    get(url, response => resolve(response))
})

const pass = () => PassThrough()

const streamPipe = await getHttpStream('http://localhost:3000')
streamPipe.pipe(pass())

const streamPipeline = await getHttpStream('http://localhost:3001')
streamPipeline.pipe(pass())

streamPipe.destroy()
streamPipeline.destroy()

const tracker = new CallTracker();
const fn = tracker.calls((msg) => {
    console.log("Stream.pipeline rejects if you don't fully consume it")
    deepStrictEqual(msg.message, "Premature close ")
    process.exit()
})

process.on('uncaughtException', fn)

await setTimeout(10)
tracker.verify()