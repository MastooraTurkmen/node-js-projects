// dependencies
const server = require('./lib/server')
const workers = require('./lib/workers')
const cli = require('./lib/cli')
const exampleDebuggingProblem = require("./lib/exampleDebuggingProblem")

// declare the app
const app = {}

// initialize the app
app.init = () => {
    // start the server
    server.init()
    debugger

    // start the workers
    debugger
    workers.init()
    debugger

    // start the CLI, but make sure it starts last
    debugger
    setTimeout(() => {
        cli.init()
        debugger
    }, 50)
    debugger

    // Set foo at 1
    debugger
    let foo = 1
    console.log("Just assigned foo")
    debugger

    foo++
    debugger

    foo = foo * foo;
    debugger

    foo = foo.toString()
    debugger

    // Call the init script that will throw
    exampleDebuggingProblem.init()
    debugger
}

// execute
app.init()

// export the app
module.exports = app
