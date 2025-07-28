import { Readable } from "node:stream";
import { ReadableStream, WritableStream, TransformStream, TextDecoderStream } from "node:stream/web";
import { setInterval, setTimeout } from "node:timers/promises";

async function* myCustomReadable() {
    yield Buffer.from("Hello-1");
    await setTimeout(200)
    yield Buffer.from("Hello-2");
}

const readable = Readable.toWeb(Readable.from(myCustomReadable()))

// const readable = new ReadableStream({
//     async start(controller) {
//         for await (const i of setInterval(200)) {
//             controller.enqueue(`Hello-${new Date().toISOString()}`)
//         }
//     }
// })

readable.pipeThrough(new TextDecoderStream()).pipeThrough(new TransformStream({
    transform(chunk, controller) {
        const data = chunk.toUpperCase();
        controller.enqueue(data)
    }
})).pipeTo(new WritableStream(
    {
        write(chunk) {
            console.log(`Received: ${chunk}`);
        },
        close() {
            console.log("Stream closed");
        }
    }
))