import Server from '../../../server/server.js'

async function getTestServer() {
    const server = Server().listen(0)

    return new Promise((resolve, reject) => {
        const onStart = err => {
            const serverUrl = `http://localhost:${server.address().port}`
            const response = {
                url: serverUrl,
                async killServer() {
                    return new Promise((resolve, reject) => {
                        server.closeAllConnections()
                        server.close(err => {
                            return err ? reject(err) : resolve()
                        })
                    })
                }
            }
            return err ?
                reject(err) :
                resolve(response)
        }

        server
            .once('listening', onStart)
            .once('error', reject)
    })
}


export {
    getTestServer,
}