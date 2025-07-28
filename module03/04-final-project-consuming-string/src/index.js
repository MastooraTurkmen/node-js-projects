import { pipeline } from "node:stream/promises";
import { renderUi, log } from "./ui.js";
import { Readable } from "node:stream"

const API_URL = 'http://localhost:3000';

async function* startConsumeAPI(signal) {
    const response = await fetch(API_URL, {
        signal
    })

    const reader = response.body.getReader()
    let done = false

    do {
        const res = await reader.read()
        done = res.done
        if (done) break

        const data = Buffer.from(res.value).toString('utf-8').split('\n')

        for (const item of data) {
            if (!item) continue
            yield item
        }
    }

    while (!done)
}

function* print(log) {
    return async function* (stream) {
        for await (const chunk of stream) {
            log(chunk.toString())
        }
    }
}


async function initialize(signal) {
    try {
        const readable = Readable.from(await startConsumeAPI(signal))
        await pipeline(
            readable,
            print(log),
            { signal }
        )
    } catch (error) {
        if (error.code === "ABORT_ERR") throw error
    }
}

renderUi(initialize)
