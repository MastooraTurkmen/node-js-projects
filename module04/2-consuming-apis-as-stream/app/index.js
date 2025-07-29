const API_URL = "http://localhost:3000";

async function consumeAPI(signal) {
    const response = await fetch(API_URL, {
        signal
    })
    const reader = response.body.pipeTo(
        new WritableStream({
            write(chunk) {
                console.log(chunk, chunk);
            }
        }))

    return reader
}

const abortController = new AbortController();
await consumeAPI(abortController.signal);