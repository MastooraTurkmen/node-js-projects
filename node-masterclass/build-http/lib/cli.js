// CLI Related Tasks

// Dependencies
const readline = require('readline')
const util = require('util')
const debug = util.debuglog('cli')
const events = require('events')

class _events extends events { }
const e = new _events()
const os = require('os')
const v8 = require('v8')

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
    const commands = {
        'man': 'Show this help page',
        'help': 'Alias of',
        'exit': 'Kill the CLI (and the rest of the application)',
        'stats': 'Get statistics on the underlying operating system and resource utilization',
        'list users': 'Show a list of all registered users',
        'more user info --{userId}': 'Show details of a specific user',
        'list checks --up --down': 'Show a list of all active checks',
        'more check info --{checkedId}': 'Show details of a specified check',
        'list logs': 'Show a list of all log files available to be read (compressed only)',
        'more log info': 'Show details of a specified log file'
    }

    // show a header for the help page that is as wide as the screen
    cli.horizontalLine()
    cli.centered('CLI MANUAL')
    cli.horizontalLine()
    cli.verticalSpace(2)


    // show each command, followed by its explanation, in white and yellow respectively
    for (let key in commands) {
        if (commands.hasOwnProperty(key)) {
            let value = commands[key]
            let line = '\x1b[33m' + key + '\x1b[0m'
            let padding = 60 - line.length
            for (let i = 0; i < padding; i++) {
                line += ' '
            }
            line += value
            console.log(line)
            cli.verticalSpace()
        }
    }

    cli.verticalSpace(1)

    // end with another horizontal line
    cli.horizontalLine()
}

// Create a vertical space
cli.verticalSpace = (lines) => {
    lines = typeof (lines) == 'number' && lines > 0 ? lines : 1
    for (let i = 0; i < lines; i++) {
        console.log('')
    }
}

// Create a horizontal line across the screen
cli.horizontalLine = () => {
    // get the available screen size
    const width = process.stdout.columns

    let line = ''
    for (let i = 0; i < width; i++) {
        line += '-'
    }
    console.log(line)
}

// Create centered text on the screen
cli.centered = (str) => {
    str = typeof (str) == 'string' && str.trim().length > 0 ? str.trim() : ''

    // get the available screen size
    const width = process.stdout.columns

    // calculate the left padding there should be
    const leftPadding = Math.floor((width - str.length) / 2)
    let line = ''
    for (let i = 0; i < leftPadding; i++) {
        line += ' '
    }
    line += str
    console.log(line)
}

// Exit
cli.responders.exit = () => {
    process.exit(0)
}

// Stats
cli.responders.stats = () => {
    // Compile an object of stats
    const stats = {
        'Load Average': os.loadavg().join(' '),
        'CPU Count': os.cpus().length,
        'Free Memory': os.freemem(),
        'Current Malloced Memory': v8.getHeapStatistics().malloced_memory,
        'Peak Malloced Memory': v8.getHeapStatistics().peak_malloced_memory,
        'Allocated Heap Used (%)': Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100) + '%',
        'Uptime': os.uptime() + ' Seconds'
    }

    // Create a header for the stats
    cli.horizontalLine()
    cli.centered('SYSTEM STATISTICS')
    cli.horizontalLine()
    cli.verticalSpace(2)

    // log out each stat
    for (let key in stats) {
        if (stats.hasOwnProperty(key)) {
            let value = stats[key]
            let line = '\x1b[33m' + key + '\x1b[0m'
            let padding = 60 - line.length
            for (let i = 0; i < padding; i++) {
                line += ' '
            }
            line += value
            console.log(line)
            cli.verticalSpace()
        }
    }
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