const http = require('http');
const https = require('https');
const { StringDecoder } = require('string_decoder');
const url = require('url')
const config = require('./config')
const fs = require('fs')
const handlers = require('./handlers');
const helpers = require('./helpers');
const path = require('path');
const util = require('util')
const debug = util.debuglog('server')

// Instantiate of http server module object
let server = {}

server.httpServer = http.createServer((req, res) => {
    server.unifiedServer(req, res)
});

// Instantiate of https server
server.httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
}
server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => {
    server.unifiedServer(req, res)
})

// start the https server

server.httpsServer.listen(config.httpsPort, () => {
    console.log(`server is listening on ${config.httpsPort}`)
})


// All the server logic for a http server
server.unifiedServer = (req, res) => {
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

        const chosenHandler = typeof (server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound

        // construct the data object to send to the handler
        const data = {
            'trimmedPath': trimmedPath,
            "queryStringObject": queryStringObject,
            "method": method,
            "headers": headers,
            "payload": helpers.parseJsonToObject(buffer)
        }

        chosenHandler(data, (statusCode, payload, contentType) => {
            // determine the type of response (fallback to JSON)
            contentType = typeof (contentType) == 'string' ? contentType : 'json';

            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

            const payloadString = ''
            if (contentType == 'json') {
                res.setHeader('Content-Type', 'application/json')
                payload = typeof (payload) == 'object' ? payload : {};
                payloadString = JSON.stringify(payload)
            }

            if (contentType == 'html') {
                res.setHeader('Content-Type', 'text/html')
                payloadString = typeof (payload) == 'string' ? payload : '';
            }

            res.writeHead(statusCode)
            res.end(payloadString)
            console.log('Returning this response:', statusCode, payloadString)

            // if the response is 200, print green, otherwise print red
            if (statusCode == 200) {
                debug('\x1b[32m%s\x1b[0m', `${method.toUpperCase()} /${trimmedPath} ${statusCode}`)
            } else {
                debug('\x1b[31m%s\x1b[0m', `${method.toUpperCase()} /${trimmedPath} ${statusCode}`)
            }
        })
    })
}

// define a request router

server.router = {
    '': handlers.index,
    'account/create': handlers.accountCreate,
    'account/edit': handlers.accountEdit,
    'account/deleted': handlers.accountDeleted,
    'session/create': handlers.sessionCreate,
    'session/deleted': handlers.sessionDeleted,
    'checks/all': handlers.checksList,
    'checks/create': handlers.checksCreate,
    'checks/edit': handlers.checksEdit,
    'ping': handlers.ping,
    'api/users': handlers.users,
    'api/tokens': handlers.tokens,
    'api/checks': handlers.checks
}


// init script
server.init = () => {
    // start the http server
    server.httpServer.listen(config.httpPort, () => {
        console.log('\x1b[36m%s\x1b[0m', `server is listening on ${config.httpPort}`)
    })

    // start the https server
    httpsServer.listen(config.httpsPort, () => {
        console.log('\x1b[35m%s\x1b[0m', `server is listening on ${config.httpsPort}`)
    })
}


// export the module
module.exports = server
