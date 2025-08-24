import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { PassThrough, Writable, Readable } from 'node:stream'
import { setInterval } from 'node:timers/promises'
import { logger, pipelineThatCanConsumePartialData } from "./util.js"
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import Throttle from "throttle"
import config from './config.js'

const {
    dir: {
        publicDirectory,
        fxDirectory
    },
    constants: {
        englishConversation,
        bitRateDivisor,
        audioMediaType,
        songVolume,
        fxVolume
    }
} = config

class Service {
    #clientStreams = new Map()
    #currentSong = englishConversation
    #currentBitRate = 0
    #throttleTransform = null
    #activeHandlers = new Map()
    #currentReadable = null

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
        return bitrate.toString().trim().replace(/k/, '000')
    }

    #broadcastToClients() {
        return new Writable({
            write: (chunk, encoding, callback) => {
                for (const [key, stream] of this.#clientStreams) {
                    // if they disconnected we should ignore them
                    if (stream.writableEnded) {
                        this.#clientStreams.delete(key)
                        continue
                    }
                    stream.write(chunk)
                }
                return callback()
            }
        })
    }

    removeClientStream(id) {
        this.#clientStreams.get(id).end()
        this.#clientStreams.delete(id)
    }

    async startStreaming() {
        logger.info(`starting streaming ${this.#currentSong}`)
        const bitRate = this.#currentBitRate = (await this.#getBitRate(this.#currentSong)) / bitRateDivisor
        const throttleTransform = this.#throttleTransform = new Throttle(bitRate)
        const songReadable = this.#currentReadable = this.#createFileStream(this.#currentSong)
        return pipelineThatCanConsumePartialData(
            songReadable, throttleTransform, this.#broadcastToClients()
        )
    }

    async stopStreaming() {
        this.#throttleTransform.end()
        this.#currentReadable.destroy()

        for (const cp of this.#activeHandlers.values()) {
            cp.stdin.destroy()
            cp.stdout.destroy()
            cp.stderr.destroy()
        }

        this.#activeHandlers.clear()
    }

    async readFxByName(fx) {
        const effects = await fsPromises.readdir(fxDirectory)
        const chosenFx = effects.find(filename => filename.toLowerCase().includes(fx))
        if (!chosenFx) {
            return Promise.reject(`the song ${fx} does not exist`)
        }

        return path.join(fxDirectory, chosenFx)
    }

    #mergeAudioStreams(song, readable) {
        const args = [
            '-t', audioMediaType,
            '-v', songVolume,
            // -m => merge
            // - => it is a string
            '-m', '-',
            '-t', audioMediaType,
            '-v', fxVolume,
            fx,
            '-t', audioMediaType,
            '-'
        ]

        const { stdout, stdin } = this.#executeSoxCommand(args)

        pipelineThatCanConsumePartialData(
            readable,
            stdin
        )

        return Readable.from(stdout)
    }

    appendFxStream(fx) {
        const throttleTransform = new Throttle(this.#currentBitRate)
        pipelineThatCanConsumePartialData(
            throttleTransform,
            this.#broadcastToClients()
        )

        const unpie = () => {
            const readableStream = this.#mergeAudioStreams(fx, this.#currentReadable)
            this.#throttleTransform = throttleTransform
            this.#currentReadable = readableStream

            pipelineThatCanConsumePartialData(
                readableStream,
                throttleTransform,
            )
        }
        this.#throttleTransform.once('unpipe', unpie)
        this.#throttleTransform.pause()
        this.#currentReadable.unpipe(this.#throttleTransform)
    }
}

export default Service