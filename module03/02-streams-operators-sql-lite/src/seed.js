import sqlite3 from "sqlite3"
import { faker } from '@faker-js/faker'
import { promisify } from "node:util"
let promises = []
const connection = sqlite3.verbose()
const db = new connection.Database('./data/db')
const serializeAsync = promisify(db.serialize.bind(db))
const runAsync = promisify(db.run.bind(db))
const userAmount = 1000
console.time('db-insert')
await serializeAsync()

await runAsync(
    "CREATE TABLE users (id TEXT, name TEXT, age NUMBER, company TEXT)"
)

function generateUser() {
    const user = {
        id: faker.datatype.uuid(),
        name: faker.internet.userName(),
        age: faker.datatype.number({ min: 4000, max: 5000 }),
        company: faker.company.name(),
    }

    return [user.id, user.name, user.age, user.company]
}

for (let i = 0; i < userAmount; i++) {
    const user = generateUser()
    promises.push(runAsync(
        `INSERT INTO users(id, name, age, company) VALUES (${user.map(_ => '?').join(',')})`,
        user
    ))
}

await Promise.all(promises)
console.log(`Inserted ${userAmount} users, ${promises.length}, items`)

db.all('SELECT COUNT(rowid) as counter FROM users', (err, row) => {
    if (err) {
        console.log('error', err)
        return
    }
    console.log('row')
    console.timeEnd('db-insert')
})