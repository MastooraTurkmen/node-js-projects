// dependencies
const server = require('./lib/server')
const workers = require('./lib/workers')
const cli = require('./lib/cli')
const cluster = require('cluster')
const os = require('os')

// declare the app
const app = {}

// initialize the app
app.init = (callback) => {
    // if we are on the master thread, start the background workers and the CLI
    if (cluster.isMaster) {
        // start the workers
        workers.init()

        // start the CLI, but make sure it starts last
        setTimeout(() => {
            cli.init()
            callback()
        }, 50)

        // Fork the process
        for (let i = 0; i < os.cpus.length; i++) {
            cluster.fork()
        }
    } else {
        // if we are not on the master thread, start the http server
        server.init()
    }
}

// self invoking only if required directly
if (require.main === module) {
    app.init(function () { })
}

// export the app
module.exports = app
