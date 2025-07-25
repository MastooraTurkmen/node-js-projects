// for i in `seq 1 100`; do node -e "process.stdout.write('$i-hello world\n')" >> text.txt; done

import { readFile } from "fs/promises"

// if it is a big file it would crash or make your program slow down
// - gonna fix it in the next class with nodejs streams
const data = (await readFile('./text.txt')).toString().split("\n")
const LINES_PER_INTERACTION = 10
const interactions = data.length / LINES_PER_INTERACTION // ten in ten lines (not bytes!)

let page = 0;

for (let index = 1; index < interactions; index++) {
    const chunk = data.slice(page, page += LINES_PER_INTERACTION).join("\n")

    // imagine this as the maximum 2GB buffer Nodejs can handle per time
    const buffer = Buffer.from(chunk)

    const amountOfBytes = buffer.byteOffset
    const bufferData = buffer.toString().split('\n')
    const amountOfLines = bufferData.length

    // now the bufferData would be splitted into small pieces and processed individually, on-demand
    console.log('processing', bufferData, `lines: ${amountOfLines}, bytes: ${amountOfBytes}`)
}