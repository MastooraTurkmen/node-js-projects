const http = require('http');
const https = require('https');
const { StringDecoder } = require('string_decoder');
const url = require('url')
const config = require('./config')
const fs = require('fs')

const httpServer = http.createServer((req, res) => {
    unifiedServer(req, res)
});

httpServer.listen(config.httpPort, () => {
    console.log(`server is listening on ${config.httpPort}`)
})

// Instantiate of https server
const httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
}
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res)
})

// start the https server

httpsServer.listen(config.httpsPort, () => {
    console.log(`server is listening on ${config.httpsPort}`)
})


// All the server logic for a http server
const unifiedServer = (req, res) => {
    // get the url and parse it
    const parsedURL = url.parse(req.url, true)

    // get the path
    const path = parsedURL.pathname
    const trimmedPath = path.replace(/^\/+|\/+$/g, '')

    // get the query string as an object
    const queryStringObject = parsedURL.query

    // get http method
    const method = req.method.toLowerCase()

    // get the headers as an object
    const headers = req.headers

    // get the payload, if any
    const decoder = new StringDecoder('utf-8')
    let buffer = ''
    req.on('data', (data) => {
        buffer += decoder.write(data)
    })

    req.on('end', () => {
        buffer += decoder.end()

        const chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound

        // construct the data object to send to the handler
        const data = {
            'trimmedPath': trimmedPath,
            "queryStringObject": queryStringObject,
            "method": method,
            "headers": headers,
            "payload": buffer
        }

        chosenHandler(data, (statusCode, payload) => {
            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;
            payload = typeof (payload) == 'object' ? payload : {};

            const payloadString = JSON.stringify(payload)

            // return the response
            res.setHeader('Content-Type', 'application/json')
            res.writeHead(statusCode)
            res.end(payloadString)
            console.log('Returning this response:', statusCode, payloadString)
        })
    })
}

// define a request handler
let handlers = {}

handlers.notFound = (data, callback) => {
    callback(404)
}

// ping handler
handlers.ping = (data, callback) => {
    callback(200)
}

// define a request router

const router = {
    'ping': handlers.ping
}
