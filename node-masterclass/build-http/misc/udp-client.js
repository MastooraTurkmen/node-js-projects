// Client UDP

const dgram = require('dgram');
const client = dgram.createSocket('udp4');

const messageString = 'Hello UDP server';
const messageBuffer = Buffer.from(messageString);

client.send(messageBuffer, 6000, 'localhost', (error) => {
    if (error) {
        console.error('Error sending message:', error);
    } else {
        console.log('Message sent to UDP server');
    }
    client.close();
});