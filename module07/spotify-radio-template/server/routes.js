import { createReadStream } from 'node:fs'
import Service from './service.js'
import Controller from './controller.js'
import {
  logger,
  pipelineThatCanConsumePartialData
} from './util.js'
import config from './config.js'
import { once } from 'node:events'
const {
  constants: {
    CONTENT_TYPES,
    englishConversation
  },
  pages: {
    homeHTML,
    controllerHTML,
  },
  location: {
    home
  },

} = config

const service = new Service()
const controller = new Controller({ service })

async function routes(request, response) {
  const method = request.method
  const path = request.url

  if (method === 'GET' && path == '/') {
    response.writeHead(302, {
      'Location': home
    })

    return response.end()
  }

  if (method === 'GET' && path == '/home') {
    const {
      stream,
    } = await controller.getFileStream(homeHTML)

    return pipelineThatCanConsumePartialData(stream, response)
  }

  if (method === 'GET' && path == '/controller') {
    const {
      stream
    } = await controller.getFileStream(controllerHTML)
    return pipelineThatCanConsumePartialData(stream, response)
  }

  if (method === "POST" && path == "/controller") {
    const data = await once(request, 'data')
    const item = JSON.parse(data)
    const result = await controller.handleCommand(item)
    return response.end(JSON.stringify(result))
  }


  if (method === 'GET' && path.includes('stream')) {

    const { onClose, stream } = controller.createClientStream()
    request.once('close', onClose)

    // const stream = createReadStream(englishConversation)

    response.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Accept-Ranges': 'bytes',
    })

    return pipelineThatCanConsumePartialData(stream, response)
  }


  // files
  if (method === 'GET') {
    const file = request.url
    const {
      type,
      stream
    } = await controller.getFileStream(file)
    const contentType = CONTENT_TYPES[type]

    if (contentType) {
      response.writeHead(200, {
        'Content-type': contentType
      })
    }
    return pipelineThatCanConsumePartialData(stream, response)
  }

  response.writeHead(404)
  return response.end()
}


function handleError(error, response) {
  if (error.message.includes('ENOENT')) {
    logger.warn(`asset not found: ${error.stack}`)
    response.writeHead(404)
    return response.end()
  }

  logger.error(`caught error on API: ${error.stack}`)
  response.writeHead(500)
  return response.end()
}

export async function handler(req, res) {
  return routes(req, res)
    .catch(error => handleError(error, res))
}