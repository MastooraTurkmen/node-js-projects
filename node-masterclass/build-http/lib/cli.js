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
const _data = require('./data')
const helpers = require('./helpers')

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
    _data.list('users', (err, userIds) => {
        if (!err && userIds && userIds.length > 0) {
            cli.responders.listUsers()

            userIds.forEach(userIds => {
                _data.read('users', userIds, (err, userIds) => {
                    if (!err && userIds) {
                        let line = `Name: ${userIds.firstName} ${userIds.lastName} Phone: ${userIds.phone} Checks: `
                        const numberOfChecks = typeof (userIds.checks) == 'object' && userIds.checks instanceof Array && userIds.checks.length > 0 ? userIds.checks.length : 0
                        line += numberOfChecks
                        console.log(line)
                        cli.verticalSpace()
                    }
                })
            })
        }
    })
}

// More User Info
cli.responders.moreUserInfo = (str) => {
    // get the userId from the string
    const arr = str.split('--')
    const userId = typeof (arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false
    if (userId) {
        // lookup the user
        _data.read('users', userId, (err, userData) => {
            if (!err && userData) {
                // remove the hashed password
                delete userData.hashedPassword

                // print the JSON with text highlighting
                cli.verticalSpace()
                console.dir(userData, { colors: true })
                cli.verticalSpace()
            } else {
                console.log('Error: Could not find specified user')
            }
        })
    } else {
        console.log('Error: You must provide a userId')
    }
}

// List Checks
cli.responders.listChecks = (str) => {
    _data.list('checks', (err, checkIds) => {
        if (!err && checkIds && checkIds.length > 0) {
            cli.verticalSpace()
            console.log(`Total Checks: ${checkIds.length}`)
            cli.verticalSpace()

            checkIds.forEach(checkId => {
                _data.read('checks', checkId, (err, checkedId) => {
                    const includeCheck = false
                    const lowerString = str.toLowerCase()

                    // Get the state, default to down
                    const state = typeof (checkId.state) == 'string' ? checkId.state : 'down'

                    // Get the state, default to unknown
                    const stateOrUnknown = typeof (checkId.state) == 'string' ? checkId.state : 'unknown'

                    // If the user has specified the state, or hasn't specified any state, include the check accordingly
                    if (lowerString.indexOf('--' + state) > -1 || (lowerString.indexOf('--up') == -1 && lowerString.indexOf('--down') == -1)) {
                        const line = `ID: ${checkId.id} Method: ${checkId.method.toUpperCase()} URL: ${checkId.protocol}://${checkId.url} State: ${stateOrUnknown} Last Checked: ${typeof (checkId.lastChecked) == 'number' && checkId.lastChecked > 0 ? new Date(checkId.lastChecked).toLocaleString() : 'Never'}`
                        console.log(line)
                        cli.verticalSpace()
                    }
                })
            })
        }
    })
}

// More Check Info
cli.responders.moreCheckInfo = () => {
    // get the checkId from the string
    const arr = str.split('--')
    const checkId = typeof (arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false
    if (checkId) {
        // lookup the check
        _data.read('checks', checkId, (err, checkData) => {
            if (!err && checkData) {
                // print the JSON with text highlighting
                cli.verticalSpace()
                console.dir(checkData, { colors: true })
                cli.verticalSpace()
            } else {
                console.log('Error: Could not find specified check')
            }
        })
    } else {
        console.log('Error: You must provide a checkId')
    }
}

// List Logs
cli.responders.listLogs = () => {
    _data.list(true, (err, logFileNames) => {
        if (!err && logFileNames && logFileNames.length > 0) {
            cli.verticalSpace()
            console.log(`Total Logs: ${logFileNames.length}`)
            cli.verticalSpace()

            logFileNames.forEach(logFileName => {
                if (logFileName.indexOf('-') > -1) {
                    console.log(logFileName)
                    cli.verticalSpace()
                }
            })
        }
    })
}

// More Log Info
cli.responders.moreLogInfo = (str) => {
    // get the logFileName from the string
    const arr = str.split('--')
    const logFileName = typeof (arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false
    if (logFileName) {
        // lookup the log file
        _data.decompress(logFileName, (err, strData) => {
            if (!err && strData) {
                // split into lines
                const arr = strData.split('\n')
                arr.forEach(jsonString => {
                    const logObject = helpers.parseJsonToObject(jsonString)
                    if (logObject && JSON.stringify(logObject) !== '{}') {
                        console.dir(logObject, { colors: true })
                        cli.verticalSpace()
                    }
                })
            } else {
                console.log('Error: Could not find specified log file')
            }
        })
    } else {
        console.log('Error: You must provide a log file name')
    }
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