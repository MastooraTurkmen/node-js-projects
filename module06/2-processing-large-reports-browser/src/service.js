export default class Service {
    processFile({ query, file, onOccurrenceUpdate, onProgress }) {
        let lineCounter = { counter: 0 }

        file.stream().pipeThrough(
            new TextDecoderStream()
        ).pipeThrough(
            this.#updateProgressBar({ onProgress, fileSize: file.size })
        ).pipeThrough(
            this.#csvToJSON()
        ).pipeThrough(
            this.#countLines(lineCounter)
        ).pipeThrough(
            this.#findOccurrences(query)
        ).pipeTo(this.#notifyProgressBar({
            onOccurrenceUpdate,
            lineCounter
        }))
        // .pipeTo(
        // new WritableStream({
        //     write(chunk, controller) {
        //         // console.log('Processing chunk', chunk);
        //     }
        // })
    }

    #notifyProgressBar({ onOccurrenceUpdate, lineCounter }) {
        const startedAt = performance.now();
        const elapsed = () => `${((performance.now() - startedAt) / 1000).toFixed(2)} seconds`

        return new WritableStream({
            write(found) {
                onOccurrenceUpdate({
                    found,
                    took: elapsed(),
                    lineCounter: lineCounter.counter
                })
            }
        })
    }

    #findOccurrences(query) {
        // {'call description': 'ski'}
        const queryKeys = Object.keys(query);
        let found = {}
        return new TransformStream({
            transform(chunk, controller) {
                for (const key of queryKeys) {
                    const value = query[key];
                    found[value] = found[value] ?? 0
                    if (value.test(chunk[key])) {
                        console.log('Found value', value);
                        found[value]++
                    }
                    controller.enqueue(found);
                }
            }
        });
    }

    #countLines(lineCounter) {
        return new TransformStream({
            transform(chunk, controller) {
                lineCounter.counter++;

                controller.enqueue(chunk);
            }
        });
    }

    #updateProgressBar({ onProgress, fileSize }) {
        let totalUpdated = 0;
        onProgress(0)

        return new TransformStream({
            transform(chunk, controller) {

                totalUpdated += chunk.length
                const total = 100 / fileSize * totalUpdated;
                onProgress(total);
                controller.enqueue(chunk);
            }
        })
    }
    #csvToJSON() {
        let _delimiter = ',';
        let _columns = '';
        let _buffer = '';

        const BREAK_LINK_SYMBOL = '\n';
        const INDEX_NOT_FOUND = -1;

        return new TransformStream({
            transform(chunk, controller) {
                _buffer = _buffer.concat(chunk);
                let breakLineIndex = 0
                while (breakLineIndex !== INDEX_NOT_FOUND) {
                    breakLineIndex = _buffer.indexOf(BREAK_LINK_SYMBOL);
                    if (!breakLineIndex === INDEX_NOT_FOUND) break
                    const lineData = consumeLineData(breakLineIndex);
                    // first line is the columns
                    if (!_columns.length) {
                        _columns = lineData.split(_delimiter);
                        continue
                    }
                    // ignore empty lines
                    if (lineData === BREAK_LINK_SYMBOL) continue
                    const result = getJSONLine(lineData);
                    if (!result) continue

                    controller.enqueue(result);
                }
            }
        })

        function getJSONLine(lineData) {
            const removeBreakLine = (text) => text.replace(BREAK_LINK_SYMBOL, '');
            const headers = Array.from(_columns);
            const dataProperties = []
            for (const lineValue of lineData.split(_delimiter)) {
                const key = removeBreakLine(headers.shift());
                const value = removeBreakLine(lineValue);
                const finalValue = value.trimEnd().replace(/"/g, '');
                dataProperties.push(`"${key}": "${finalValue}"`);
            }

            if (!dataProperties.length) return null;
            const data = dataProperties.join(',');

            return JSON.parse('{'.concat(data).concat('}'));
        }

        function consumeLineData(breakLineIndex) {
            const lineToProgressIndex = breakLineIndex + BREAK_LINK_SYMBOL.length;
            const line = _buffer.slice(0, lineToProgressIndex)
            // i will remove from the main buffer the data the first information until \n
            // 01,erick,02\n03,ana,05\n
            // line = 01,erick,02\n
            // _buffer = 03,ana,05\n

            _buffer = _buffer.slice(lineToProgressIndex);
            return line;
        }
    }
}
