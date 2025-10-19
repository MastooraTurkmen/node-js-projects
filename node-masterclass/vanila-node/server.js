const http = require('http')
const products = require('./data/products.json')
const PORT = process.env.PORT || 3000

const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify(products))
})

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`)
})