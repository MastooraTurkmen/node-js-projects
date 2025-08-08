import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'
import config from './config.js'
import { randomUUID } from 'node:crypto'
import { PassThrough } from 'node:stream'
import { setInterval } from 'node:timers/promises'
import { logger } from "./util.js"
import { spawn } from 'node:child_process'
import { once } from 'node:events'

const {
    dir: {
        publicDirectory
    },
    constants: {
        englishConversation
    }
} = config

class Service {
    #clientStreams = new Map()
    #currentSong = englishConversation
    #currentBitRate = 0
    #activeHandlers = new Map()

    #createFileStream(file) {
        return fs.createReadStream(file)
    }

    async getFileInfo(file) {
        const fullPathFile = path.join(publicDirectory, file)
        await fsPromises.access(fullPathFile)
        const fileType = path.extname(fullPathFile)
        return {
            type: fileType,
            name: fullPathFile
        }
    }

    async getFileStream(file) {
        const {
            name,
            type
        } = await this.getFileInfo(file)

        return {
            stream: this.#createFileStream(name),
            type
        }
    }

    getClientStream(file) {
        const id = randomUUID()
        const clientStream = new PassThrough()
        this.#clientStreams.set(id, clientStream)

        // just to unlock streams during tests and keep the connection alive
        clientStream.write(Buffer.alloc(1))

        setInterval(() => {
            clientStream.write(Buffer.alloc(1))
        }, 100).unref()


        return { id, clientStream }
    }

    #executeSoxCommand(args) {
        const cp = spawn('sox', args)
        this.#activeHandlers.set(cp.pid, cp)
        return cp
    }

    async #getBitRate(song) {
        const args = [
            '--i',
            '-B',
            song
        ]
        const { stdout } = this.#executeSoxCommand(args)
        const bitrate = await once(stdout, 'data')
        return bitrate.toString().trim()
    }

    async startStreaming() {
        logger.info(`starting streaming ${this.#currentSong}`)
        const bitRate = await this.#getBitRate(this.#currentSong)
        console.log(`bitrate: ${bitRate}`)
    }
}

export default Service