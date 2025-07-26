// transform - SQL data (sqlite) to noSQL (json data)

import sqlite3 from "sqlite3"
import { promisify } from "node:util"
import { Readable } from "node:stream"
const connection = sqlite3.verbose()
const db = new connection.Database('./data/db')
const serializeAsync = promisify(db.serialize.bind(db))
const runAsync = promisify(db.run.bind(db))
const FindAllAsync = promisify(db.all.bind(db))


await serializeAsync()

async function* selectAsStream() {
    const defaultLimit = 100;
    let skip = 0;

    while (true) {
        const data = await FindAllAsync(
            `SELECT * FROM users LIMIT ${defaultLimit} OFFSET ${skip}`
        )
        skip += defaultLimit;

        // if we've consumed all data it is gonna stop!
        if (!data.length) break;
        console.log('data', data)
        for (const item of data) yield item

    }
}

const stream = Readable.from(selectAsStream())
stream.forEach(item => console.log(item))