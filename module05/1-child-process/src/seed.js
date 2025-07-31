import { faker } from '@faker-js/faker';

function createRandomUser() {
    return {
        userId: faker.string.uuid(),
        username: faker.internet.userName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        registeredAt: faker.date.past(),
    }
}

console.log(createRandomUser());