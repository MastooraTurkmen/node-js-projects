import { createServer } from "node:http"
import { createReadStream } from "node:fs"
import { Readable, Transform } from "node:stream"
import { WritableStream, TransformStream } from "node:stream/web"
import csvtojson from "csvtojson"
import { setTimeout } from "node:timers/promises"

const PORT = 3000

createServer(async (req, res) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
    }

    if (req.method === 'OPTIONS') {
        res.writeHead(204, headers)
        res.end()
        return
    }

    let items = 0
    const abortController = new AbortController()

    req.once('close', () => {
        console.log(`Connection closed, items processed: ${items}`)
        abortController.abort()
    })
    try {

        await Readable.toWeb(createReadStream('./animeflv.csv')).pipeThrough(
            Transform.toWeb(csvtojson())
        ).pipeThrough(new TextDecoder()).pipeThrough(new TransformStream({
            transform(chunk, controller) {
                const data = JSON.parse(Buffer.from(chunk))

                const mappedData = JSON.stringify({
                    title: data.title,
                    description: data.description,
                    url: data.url_anime
                })

                controller.enqueue(mappedData.concat('\n'))
            }
        })).pipeTo(new WritableStream({
            async write(chunk) {
                await setTimeout(200)
                items++
                res.write(chunk)
            },
            abort(reason) {
                console.log("aborted", reason)
            },
            close() {
                res.end()
            }
        }), {
            signal: abortController.signal
        })
    } catch (error) {
        if (error.code !== 'ABORT_ERR') throw error
    }

}).listen(3000).on('listening', _ => {
    console.log(`Server is listening on port ${PORT}`)
})