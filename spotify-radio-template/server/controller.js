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
      this.#service.removeClientStream(id)
    }

    return { stream: clientStream, onClose }
  }

  async handleCommand({ command }) {
    const result = {
      result: 'ok',
    }
    const cmd = command.toLowerCase()
    logger.info(`cmd received: ${cmd}`)
    if (cmd.includes('start') && this.#isPlaying) {
      this.#isPlaying = true
      // I won't use await because this won't return until the stream is closed
      this.#service.startStreaming()

      return result
    }

    if (cmd.includes('stop')) {
      this.#isPlaying = false
      this.#service.stopStreaming()

      return result
    }

    const fx = await this.#service.readFxByName(cmd)
    this.#service.appendFxStream(fx)
    return result
  }

}

export default Controller