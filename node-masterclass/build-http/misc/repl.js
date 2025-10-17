// Example REPL (Read-Eval-Print Loop) Server

const repl = require('repl')

// start the REPL server
repl.start({
    'prompt': '>', 'eval': function (str) {
        console.log(`You just typed: ${str}`)

        if (str.indexOf('fizz') > -1) {
            console.log('buzz')
        }
    }
})