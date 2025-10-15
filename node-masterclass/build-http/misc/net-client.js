// Example TCP (NET) Client

const net = require('net')

const outboundMessage = 'ping'

const client = net.createConnection({
    'ping': 6000
}, () => {
    client.write(outboundMessage)
})

client.on('data', (inboundMessage) => {
    const messageString = inboundMessage.toString()
    console.log(`I wrote ${outboundMessage} and they said ${messageString}`)
    client.end()
})