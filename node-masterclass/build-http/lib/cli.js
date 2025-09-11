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

// Input handlers
e.on('man', str => {
    cli.responders.help()
})

e.on('help', str => {
    cli.responders.help()
})

e.on('exit', str => {
    cli.responders.exit()
})

e.on('stats', str => {
    cli.responders.stats()
})

e.on('list users', str => {
    cli.responders.listUsers()
})

e.on('more user info', str => {
    cli.responders.moreUserInfo(str)
})

e.on('list checks', str => {
    cli.responders.listChecks()
})

e.on('more check info', str => {
    cli.responders.moreCheckInfo()
})

e.on('list logs', str => {
    cli.responders.listLogs()
})

e.on('more log info', str => {
    cli.responders.moreLogInfo(str)
})

// Responders object
cli.responders = {}

// Help/ Man
cli.responders.help = () => {
    console.log('You asked for help')
}

// Exit
cli.responders.exit = () => {
    process.exit(0)
}

// Stats
cli.responders.stats = () => {
    console.log('You asked for stats')
}

// List Users
cli.responders.listUsers = () => {
    console.log('You asked to list users')
}

// More User Info
cli.responders.moreUserInfo = (str) => {
    console.log('You asked for more user info', str)
}

// List Checks
cli.responders.listChecks = () => {
    console.log('You asked to list checks')
}

// More Check Info
cli.responders.moreCheckInfo = () => {
    console.log('You asked for more check info')
}

// List Logs
cli.responders.listLogs = () => {
    console.log('You asked to list logs')
}

// More Log Info
cli.responders.moreLogInfo = (str) => {
    console.log('You asked for more log info', str)
}

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