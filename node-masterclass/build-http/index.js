// dependencies
const server = require('./lib/server')
const workers = require('./lib/workers')
const cli = require('./lib/cli')

// declare the app
const app = {}

// initialize the app
app.init = (callback) => {
    // start the server
    server.init()

    // start the workers
    workers.init()

    // start the CLI, but make sure it starts last
    setTimeout(() => {
        cli.init()
        callback()
    }, 50)
}

// self invoking only if required directly
if (require.main === module) {
    app.init(function () { })
}

// export the app
module.exports = app
