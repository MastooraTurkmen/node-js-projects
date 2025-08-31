// dependencies
const server = require('./lib/server')
const workers = require('./lib/workers')

// declare the app
const app = {}

// initialize the app
app.init = () => {
    // start the server
    server.init()

    // start the workers
    workers.init()
}

// execute
app.init()

// export the app
module.exports = app
