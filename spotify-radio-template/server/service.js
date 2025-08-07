import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'
import config from './config.js'
import { randomUUID } from 'node:crypto'
import { PassThrough } from 'node:stream'
import { setInterval } from 'node:timers/promises'
import { logger } from "./util.js"
import { spawn } from 'node:child_process'

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
    }

    async #getBitRate(song) {
        const args = [
            '--i',
            '-B',
            song
        ]
    }

    startStreaming() {
        logger.info(`starting streaming ${this.#currentSong}`)
    }
}

export default Service