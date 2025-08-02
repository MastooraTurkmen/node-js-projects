import { faker } from '@faker-js/faker';
import { createWriteStream } from 'node:fs';

const file1 = createWriteStream('database/file1.ndjson')
const file2 = createWriteStream('database/file2.ndjson')
const file3 = createWriteStream('database/file3.ndjson')

function createRandomUser() {
    return {
        userId: faker.string.uuid(),
        username: faker.internet.username(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        registeredAt: faker.date.past(),
    }
};

[file1, file2, file3].forEach((file, index) => {
    const currentFile = `file${index + 1}`
    console.time(currentFile)

    for (let i = 0; i < 1e2; i++) {
        file.write(`${JSON.stringify(createRandomUser())}\n`)
    }
    file.end()
    console.log(`Writing to ${currentFile}...`)
})
