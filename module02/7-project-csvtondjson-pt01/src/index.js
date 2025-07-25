
/*
echo "id,name,desc,age" > big.csv
for i in `seq 1 2`; do node -e "process.stdout.write('$i,erick-$i,$i-text,$i\n'.repeat(1e5))" >> big.file
*/

import CSVToNDJSON from "./streamComponents/csvtondjson";
import { log } from "./util";
import Reporter from "./streamComponents/reporter.js";
import { statSync, createReadStream, createWriteStream } from "node:fs";
import { pipeline, Readable, Transform } from "node:stream";

const { size } = statSync('./big.csv')
const reporter = new Reporter()
const fileName = 'big.csv'

const { size: fileSize } = statSync(fileName)
const processData = Transform({
    transform(chunk, encoding, callback) {
        const data = JSON.parse(chunk)
        const result = JSON.stringify({ ...data, id: counter++ }).concat('\n')
        callback(null, result)
    }
})

const csvToNDJSON = new CSVToNDJSON({
    delimiter: ',',
    headers: ['id', 'name', 'desc', 'age'],
})

const startedAt = Date.now()
await pipeline(
    createReadStream(fileName),
    csvToNDJSON,
    processData,
    reporter.progress(fileSize),
    createWriteStream('big.ndjson')
)

const A_MILLISECOND = 1000
const A_MINUTE = 60

const timeInSecond = Math.round((Date.now() - startedAt) / A_MILLISECOND).toFixed(2)
const finalTime = timeInSecond > A_MILLISECOND ? `${timeInSecond / A_MINUTE}m` : `${timeInSecond}s`

log(`took: ${finalTime} - process finished with success! `)