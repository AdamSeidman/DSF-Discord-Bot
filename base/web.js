const connect = require('connect')
const serveStatic = require('serve-static')
const http = require('http')

var setup = function () {
    connect().use(serveStatic('../http/')).listen(8080, () => {
        console.log('UI Server Running on Port 8080.')
    })

    http.createServer((request, response) => {
        console.log(request.url) // TODO
        response.statusCode = 200
        response.end()
    }).listen(8081)

    console.log('Command Server Running on Port 8081')
}

module.exports = {
    setupWebServers: setup
}