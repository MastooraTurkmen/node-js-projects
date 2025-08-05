import { it, describe, before, beforeEach, afterEach, after } from 'node:test'
import assert from 'node:assert'
import { getTestServer } from './helpers.js'
import fs from 'fs'
import config from './../../../server/config.js'

describe('API E2E Test suite', () => {
    let _server;
    beforeEach(async () => {
        _server = await getTestServer()
    })
    afterEach(async () => {
        await _server.killServer()
    })
    describe("client workflow", () => {
        it("should not receive data stream if the process in not playing", async (context) => {
            const { url } = _server
            const onChunk = context.mock.fn()

            assert.strictEqual(
                onChunk.mock.callCount(), 0,
                `Expect onChunk to not have been called, but got ${onChunk.mock.callCount()}`
            )
        })
    })
})