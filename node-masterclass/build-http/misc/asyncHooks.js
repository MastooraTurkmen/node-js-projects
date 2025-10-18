// Async Hooks Example

const async_hooks = require('async_hooks')
const fs = require('fs')

// Target execution context ID
const targetExecutionContext = false

const whatTimeIsIt = function (callback) {
    setInterval(() => {
        fs.writeSync(1, `When the setInterval fires, the execution context is: ${async_hooks.executionAsyncId()}\n`)
        callback(Date.now())
    }, 1000)
}

// CALL THE FUNCTION
whatTimeIsIt((time) => {
    fs.writeSync(1, `The time is: ${time}\n`)
})

// Hooks
const hooks = {
    init(async_id, type, trigger_async_id, resource) {
        fs.writeSync(1, `Hook init: async_id: ${async_id}\n`)
    },

    before(async_id) {
        fs.writeSync(1, `Hook before: async_id: ${async_id}\n`)
    },

    after(async_id) {
        fs.writeSync(1, `Hook after: async_id: ${async_id}\n`)
    },

    destroy(async_id) {
        fs.writeSync(1, `Hook destroy: async_id: ${async_id}\n`)
    },

    promiseResolve(async_id) {
        fs.writeSync(1, `Hook promiseResolve: async_id: ${async_id}\n`)
    }
}

// Create Async Hook instance
const asyncHook = async_hooks.createHook(hooks)
asyncHook.enable();