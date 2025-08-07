import { logger } from './util.js'

class Controller {
  #service
  #isPlaying = false

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

  handleCommand({ command }) {
    const result = {
      result: 'ok',
    }
    const cmd = command.toLowerCase()
    logger.info(`cmd received: ${cmd}`)
    if (cmd.includes('start') && this.#isPlaying) {
      this.#isPlaying = true

      return result
    }

    if (cmd.includes('stop')) {
      this.#isPlaying = false

      return result
    }
  }

}

export default Controller