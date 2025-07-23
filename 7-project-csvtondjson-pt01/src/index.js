
/*
echo "id,name,desc,age" > big.csv
for i in `seq 1 2`; do node -e "process.stdout.write('$i,erick-$i,$i-text,$i\n'.repeat(1e5))" >> big.file
*/

import CSVToNDJSON from "./streamComponents/csvtondjson";
import { log } from "./util";
import Reporter from "./streamComponents/reporter.js";
import { statSync, createReadStream } from "node:fs";

const { size } = statSync('./big.csv')
const reporter = new Reporter()
const fileName = './big.csv'