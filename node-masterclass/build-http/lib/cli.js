// CLI Related Tasks

// Dependencies
const readline = require('readline')
const util = require('util')
const debug = util.debuglog('cli')
const events = require('events')

class _events extends events { }
const e = new _events()

// Instantiate the CLI module object
const cli = {}

// Input processors
cli.processInput = (str) => {
    str = typeof (str) == 'string' && str.trim().length > 0 ? str.trim() : false

    if (str) {
        // codify the unique strings that identify the unique questions allowed to be asked
        const uniqueInputs = [
            'man',
            'help',
            'exit',
            'stats',
            'list users',
            'more user info',
            'list checks',
            'more check info',
            'list logs',
            'more log info'
        ];

        // go through the possible inputs, emit an event when a match is found
        let matchFound = false
        let counter = 0

        uniqueInputs.some(input => {
            if (str.toLowerCase().indexOf(input) > -1) {
                matchFound = true
                // emit event
                e.emit(input, str)
                return true
            }
        })

        // if no match is found, tell the user to try again
        if (!matchFound) {
            console.log("Sorry, try again")
        }
    }
}

// init script

cli.init = () => {
    // send the start message to the console, in dark blue
    console.log('\x1b[34m%s\x1b[0m', 'The CLI is running')

    // start the interface
    const _interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: ''
    })

    // create an initial prompt
    _interface.prompt()

    // handle each line of input separately
    _interface.on('line', (str) => {
        // send to the input processor
        cli.processInput(str)

        // re-initialize the prompt afterwards
        _interface.prompt()
    })

    // if the user stops the CLI, kill the associated process
    _interface.on('close', () => {
        process.exit(0)
    })


}



// export the module
module.exports = cli