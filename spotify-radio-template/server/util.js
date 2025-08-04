import pino from 'pino'
import { pipeline } from 'node:stream/promises'

const logger = pino({
  enabled: !(!!process.env.LOG_DISABLED),
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  },
})

const pipelineThatCanConsumePartialData = (...args) => {
  return pipeline(...args).catch(err => {
    if (err.code === 'ERR_STREAM_PREMATURE_CLOSE') return
    return Promise.reject(new Error(err))
  })
}

export {
  logger,
  pipelineThatCanConsumePartialData
}