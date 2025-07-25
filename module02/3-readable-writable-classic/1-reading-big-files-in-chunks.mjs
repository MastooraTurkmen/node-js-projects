// for i in `seq 1 3`; do node -e "process.stdout.write('hello world'.repeat(1e7))" >> big.file; done

import { createReadStream, promises, statSync } from 'node:fs';
const fileName = 'big.file';

try {
    const file = await promises.readFile(fileName)
    console.log('file buffer', file)
    console.log('file size', file.byteLength / 1e9, "GB", "\n")
} catch (error) {
    console.log('error: max 2GB reached..', error.message)
}

const { size } = statSync(fileName)
console.log("file size", size / 1e9, "GB", "\n")

let chunkConsumed = 0

const stream = createReadStream(fileName)

    // 65K per readable! 
    .once('data', msg => {
        console.log('on data length', msg.toString().length)
    })

    .once('readable', _ => {
        // this stream.read(11) will trigger the on(data) event
        console.log('read 11 chunk bytes', stream.read(11).toString())
        console.log('read 05 chunk bytes', stream.read(4).toString())

        chunkConsumed += 11
    })
    .on('readable', _ => {
        let chunk;
        // stream.read() reads max 65K bytes at once
        while (null !== (chunk = stream.read())) {
            chunkConsumed += chunk.length;
        }
    })

    .on('end', () => {
        console.log(`Read ${chunkConsumed} bytes of data..`)
    })