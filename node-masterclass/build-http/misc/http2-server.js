// Example HTTP/2 Server

// Dependencies
const http2 = require('http2');

// Init server

const server = http2.createServer()


// On a stream, send back hello world html

server.on('stream', (stream, headers) => {
    stream.respond({
        'status': 200,
        'content-type': 'text/html'
    })
    stream.end('<html><body><h1>Hello World</h1></body></html>')
})

// Listen on port 6000

server.listen(6000)