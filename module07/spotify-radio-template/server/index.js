import config from "./config.js"
import server from "./server.js"
import { logger } from './util.js'

server().listen(config.port)
.on('listening', () => logger.info(`server running at ${config.port}!!`))

// make sure any unhandled error from the application will be logged
// prevents the application from crashing
// uncaughtException => throw
// unhandledRejection => Promises
process.on('uncaughtException', (error) => logger.error(`unhandledRejection happened: ${error.stack || error }`))
process.on('unhandledRejection', (error) => logger.error(`unhandledRejection happened: ${error.stack || error }`))