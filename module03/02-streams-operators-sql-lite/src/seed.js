import sqlite3 from "sqlite3"
import { faker } from '@faker-js/faker'
import { promisify } from "node:util"

const connection = sqlite3.verbose()
const db = new connection.Database('./data/db')
const serializeAsync = promisify(db.serialize.bind(db))
const runAsync = promisify(db.run.bind(db))

console.time('db-insert')
await serializeAsync

await runAsync(
    " CREATE TABLE users (id TEXT, name TEXT, age NUMBER, company TEXT)"
)
console.timeEnd('db-insert')