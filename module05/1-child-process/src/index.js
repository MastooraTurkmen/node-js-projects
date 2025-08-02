import { readdir } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { fork } from 'node:child_process';
import { PassThrough, Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const backgroundJob = "./src/backgroundJob.js"
const outputFileName = './database/output-gmail.ndjson'
const output = createWriteStream(outputFileName);

console.time('child processing')

function merge(streams) {
    let pass = new PassThrough()
    let waiting = streams.length

    for (const stream of streams) {
        pass = stream.pipe(pass, { end: false })
        stream.once('end', () => --waiting === 0 && pass.emit('end'))
    }

    return pass
}


function childProcessAsString(cp, file) {
    const stream = Readable({
        read() {

        }
    })
    cp.on("message", ({ status, message }) => {
        if (status === 'error') {
            console.log({
                msg: 'error in child process',
                pid: cp.pid,
                message: message.split('\n'),
                file
            })

            // this will make our stream for this file stop
            stream.push(null)
            return
        }
        stream.push(JSON.stringify({
            ...message,
            file,
            pid: cp.pid
        }).concat('\n'))
    })
    cp.send(file)
    return stream
}

const files = (await readdir('./database')).filter(item => !item.includes('output'))

const counters = {}
const childProcesses = []

for (const file of files) {
    const cp = fork(backgroundJob, [], {
        // this will print out the consoles we have in the background Job
        silent: false
    })

    counters[cp.pid] = { counter: 1 }

    const stream = childProcessAsString(cp, `./database/${file}`)
    childProcesses.push(stream)
}

const allStreams = merge(childProcesses)

await pipeline(
    allStreams,
    async function* (source) {
        for await (const chunk of source) {
            for (const line of chunk.toString().trim().split('\n')) {
                const { file, ...data } = JSON.parse(line);
                const counter = counters[data.pid].counter++
                console.log(`${file} founder ${counter} so far`);
                yield JSON.stringify(data).concat('\n');
            }
        }
    },
    output
)
console.timeEnd('child processing')