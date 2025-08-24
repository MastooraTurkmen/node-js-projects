import {
  createServer
} from 'node:http'
import {
  handler
} from './routes.js'

export default () => createServer(handler)