import { logger } from './util.js'

class Controller {
  #service

  constructor({ service }) {
    this.#service = service
  }

  async getFileStream(filename) {
    return this.#service.getFileStream(filename)
  }

  createClientStream() {
    const { id, clientStream } = this.#service.getClientFileName();

    const onClose = () => {
      logger.info(`closing connection to ${id}...`)
    }

    return { stream: clientStream, onClose }
  }

}

export default Controller