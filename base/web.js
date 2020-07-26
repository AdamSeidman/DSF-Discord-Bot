const connect = require('connect')
const serveStatic = require('serve-static')
const http = require('http')
const refreshItems = require('../db/handlers/random-items').refreshItems

var setup = function () {
    connect().use(serveStatic(`${__dirname}\\..\\http\\`)).listen(8080, () => {
        console.log('UI Server Running on Port 8080.')
    })

    http.createServer((request, response) => {
        console.log(`POST: '${request.url.slice(1)}'`)
        if (request.url === '/refresh') {
            console.log('\nItem Refresh Requested.')
            refreshItems()
        }
        response.statusCode = 200
        response.end()
    }).listen(8081)

    console.log('Command Server Running on Port 8081')
}

module.exports = {
    setupWebServers: setup
}