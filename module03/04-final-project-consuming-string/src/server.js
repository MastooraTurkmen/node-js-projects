import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { setInterval } from 'node:timers/promises';
import { Readable } from 'node:stream';


//curl -N localhost:3000
async function* readable() {
    let counter = 0
    for await (const i of setInterval(40)) {
        // node by default controls the backpressure
        // the \n will help us the split the chunk in case
        // it send too much data at once
        const item = JSON.stringify({
            id: randomUUID(),
            name: `Erick-${Date.now()}`
        }).concat('\n')
        console.count('item sent')
        yield item
        if (++counter >= 600) break
    }
}

createServer((req, res) => {
    Readable.from(readable()).pipe(res)
}).listen(3000, () => console.log('Server is running on port 3000'));