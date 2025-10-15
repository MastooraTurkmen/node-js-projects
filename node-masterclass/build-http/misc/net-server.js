// Example TCP (NET) Server

const net = require('net')

// create server
const server = net.createServer(function (connection) {
    const outboundMessage = 'pong'
    connection.write(outboundMessage)

    connection.on('data', (inboundMessage) => {
        const messageString = inboundMessage.toString()
        console.log(`I wrote ${outboundMessage} and they said ${messageString}`)
    })
})


// listen
server.listen(6000)