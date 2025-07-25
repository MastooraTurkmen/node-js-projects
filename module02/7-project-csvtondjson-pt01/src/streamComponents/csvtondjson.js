import { Transform } from 'node:stream';

const BREAK_LINE_SYMBOL = '\n'
const INDEX_NOT_FOUND = -1

export default class CSVToNDJSON extends Transform {
    #delimiter = ''
    #headers = []
    #buffer = Buffer.alloc(0)

    constructor({
        delimiter = ',',
        headers
    }) {
        super()

        this.#delimiter = delimiter
        this.#headers = headers
    }

    * #updateButter(chunk) {
        // it will ensure if we got a chunk that is not completed
        // and doesn't have break line
        // will concat with the previous read chunk
        // 1st time =01,
        // 2st time =, erick,address\n
        // trey parsing and returning data! 
        this.#buffer = Buffer.concat([this.#buffer, chunk])
        let breakLineIndex = 0
        while (breakLineIndex !== INDEX_NOT_FOUND) {
            breakLineIndex = this.#buffer.indexOf(Buffer.from(BREAK_LINE_SYMBOL))
            if (breakLineIndex === INDEX_NOT_FOUND) break

            const lineDataIndex = breakLineIndex + BREAK_LINE_SYMBOL.length
            const line = this.#buffer.subarray(0, lineDataIndex)
            const lineData = line.toString()
            console.log(lineData)

            // I will remove from the buffer the data
            // we already processed
            this.#buffer = this.#buffer.subarray(lineDataIndex)

            // if it is an empty line ignore this line
            if (lineData === BREAK_LINE_SYMBOL) continue;
            const NDJSONLine = []
            const headers = Array.from(this.#headers)
            for (const item of lineData.split(this.#delimiter)) {
                const key = headers.shift()
                const value = item.replace(BREAK_LINE_SYMBOL, "")

                if (key === value) break

                NDJSONLine.push(`"${key}": "${value}"`)
            }

            if (!NDJSONLine.length) continue
            const ndJSONData = NDJSONLine.join(',')
            yield Buffer.from('{'.concat(ndJSONData).concat('}').concat(BREAK_LINE_SYMBOL))
        }
    }

    _transform(chunk, encoding, callback) {
        for (const item of this.#updateButter(chunk)) {
            this.push(item)
        }

        return callback()
    }

    // when it finishes processing
    // this.push(null) on the readable side
    _final(callback) {
        if (!this.#buffer.length) return callback()

        for (const item of this.#updateButter(Buffer.from(BREAK_LINE_SYMBOL))) {
            this.push(item)
        }

        callback()
    }
}