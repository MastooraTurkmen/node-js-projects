import Server from '../../../server/server.js'
import { setInterval, setTimeout } from 'node:timers/promises'

async function getTestServer() {
    const server = Server().listen(0)

    return new Promise((resolve, reject) => {
        const onStart = err => {
            const serverUrl = `http://localhost:${server.address().port}`
            const response = {
                url: serverUrl,
                async killServer() {
                    return new Promise((resolve, reject) => {
                        server.closeAllConnections()
                        server.close(err => {
                            return err ? reject(err) : resolve()
                        })
                    })
                }
            }
            return err ?
                reject(err) :
                resolve(response)
        }

        server
            .once('listening', onStart)
            .once('error', reject)
    })
}


async function pipeAndReadStreamData(url, onChunk, timeout = 10) {
    const response = await fetch(`${url}/stream`)
    const reader = response.body.getReader()
    const startedAt = Date.now()
    for await (const now of setInterval(1)) {
        const { done, value } = await Promise.race([
            reader.read(),
            setTimeout(timeout).then(() => ({ done: true }))
        ])
        if (done || Date.now() - startedAt > timeout) {
            reader.cancel()
            break
        }

        // ignore <Buffer 00>
        if (Buffer.compare(Buffer.from(value), Buffer.alloc(1)) === 0) {
            continue
        }
        onChunk(value)
    }
}

export {
    getTestServer,
    pipeAndReadStreamData
}