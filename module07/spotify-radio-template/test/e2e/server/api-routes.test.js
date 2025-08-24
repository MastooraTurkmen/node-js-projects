import { it, describe, before, after } from 'node:test'
import assert from 'node:assert'
import { getTestServer } from './helpers.js'
import fs from 'fs'
import config from './../../../server/config.js'

const {
    dir: {
        publicDirectory
    },
    pages: {
        homeHTML,
        controllerHTML,
    }
} = config

describe('API routes', () => {
    let _mainServer
    before(async () => {
        _mainServer = await getTestServer()
    })

    after(async () => {
        await _mainServer.killServer()
    })

    it('GET /unknown - given an unknown route, it should respond with 404 status code', async () => {
        const response = await fetch(`${_mainServer.url}/unknown`)
        assert.strictEqual(response.status, 404)
    })

    it('GET / - it should respond with the home location and 302 status code', async () => {
        const response = await fetch(`${_mainServer.url}`)
        assert.strictEqual(response.redirected, true)
        assert.strictEqual(response.url, `${_mainServer.url}/home`)
    })

    it('GET /home - it should respond with file stream', async () => {
        const response = await fetch(`${_mainServer.url}/home`)
        const homePage = await fs.promises.readFile(`${publicDirectory}/${homeHTML}`)
        assert.deepStrictEqual(await response.text(), homePage.toString())
    })

    it('GET /controller - it should respond with file stream', async () => {
        const response = await fetch(`${_mainServer.url}/controller`)
        const controllerPage = await fs.promises.readFile(`${publicDirectory}/${controllerHTML}`)
        assert.deepStrictEqual(await response.text(), controllerPage.toString())
    })

    describe('static files', () => {
        it('GET /file.js - it should respond with 404 if file doesn\'t exist', async () => {
            const file = 'file.js'
            const response = await fetch(`${_mainServer.url}/${file}`)
            assert.strictEqual(response.status, 404)
        })

        it('GET /controller/css/index.css - given a CSS file, it should respond with content-type text/css', async () => {
            const file = 'controller/css/index.css'
            const response = await fetch(`${_mainServer.url}/${file}`)
            const existingPage = await fs.promises.readFile(`${publicDirectory}/${file}`)
            assert.deepStrictEqual(await response.text(), existingPage.toString())
            assert.strictEqual(response.status, 200)
            assert.strictEqual(response.headers.get('content-type'), 'text/css')
        })

        it('GET /home/js/animation.js - given a JS file, it should respond with content-type text/javascript', async () => {
            const file = 'home/js/animation.js'
            const response = await fetch(`${_mainServer.url}/${file}`)
            const existingPage = await fs.promises.readFile(`${publicDirectory}/${file}`)
            assert.deepStrictEqual(await response.text(), existingPage.toString())
            assert.strictEqual(response.status, 200)
            assert.strictEqual(response.headers.get('content-type'), 'text/javascript')
        })

        it('GET /controller/index.html - given an HTML file, it should respond with content-type text/html', async () => {
            const file = controllerHTML
            const response = await fetch(`${_mainServer.url}/${file}`)
            const existingPage = await fs.promises.readFile(`${publicDirectory}/${file}`)
            assert.deepStrictEqual(await response.text(), existingPage.toString())
            assert.strictEqual(response.status, 200)
            assert.strictEqual(response.headers.get('content-type'), 'text/html')
        })
    })
})
