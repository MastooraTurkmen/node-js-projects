const buffer = Buffer.alloc(5)
buffer.fill('h1', 0, 2)
buffer.fill(0x3a, 2, 3) // Hexadecimal for ':'
buffer.fill(0x29, 4, 5) // Hexadecimal for ')'

// error when it reaches max value, it should move to another buffer
// buffer.fill('hi, 5, 6) // Hexadecimal for

const anotherBuffer = Buffer.alloc(6)
anotherBuffer.fill(buffer, buffer.byteOffset)
anotherBuffer.fill('four', 5, 6) // Hexadecimal for 'four'

// console.log({ buffer })
console.log(buffer.toString(), buffer, buffer.byteLength)


// or with full data
const message = 'Hey there!'
const perAllocated = Buffer.alloc(message.length, message)
const withBufferFrom = Buffer.from(message)

// same thing of Buffer.(message)
console.log(perAllocated.toString(), perAllocated, perAllocated.byteLength)
console.log(withBufferFrom.toString(), withBufferFrom, withBufferFrom.byteLength)


// -------

const str = "Hello World!"

const charCodes = []
const bytes = []

for (const index in str) {
    // integer or decimals
    const code = str.charCodeAt(index)
    const byteCode = '0x' + Math.abs(code).toString(16)
    charCodes.push(code)
    bytes.push(byteCode)
}

console.log({
    charCodes,
    bytes,
    contentFromCharCodes: Buffer.from(charCodes).toString(),
    contentFromHexaBytes: Buffer.from(bytes).toString()
})