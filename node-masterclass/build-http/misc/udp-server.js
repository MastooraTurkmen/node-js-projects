// UDP server

const dgram = require('dgram');
const server = dgram.createSocket('udp4');

server.on('message', (messageBuffer, sender) => {
    const messageString = messageBuffer.toString()
    console.log(`Received message: ${messageString} from ${sender.address}:${sender.port}`);
})

// Bind
server.bind(6000)