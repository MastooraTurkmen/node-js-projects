
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

await pipeline(
    createReadStream(fileName),
    csvToNDJSON,
    processData,
    reporter.progress(fileSize),
    createWriteStream('big.ndjson')
)