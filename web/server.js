const connect = require('connect')
const serveStatic = require('serve-static')
const utils = require('../base/utils')
const fixCh = utils.fixPathCharacters

var createServer = function (fileLocation, endpoints, port) {
    var server = connect()
    server.use(serveStatic(fileLocation))
    endpoints.forEach(item => {
        server.use(`/${item.path}`, (req, res) => {
            handleHttpRequest(item, req, res)
        })
    })
    server.listen(port)
    console.log(`Server Initialized on Port ${port}.`)
    return server
}

var handleHttpRequest = function (item, request, response) {
    let data = undefined
    if (request.headers['access-control-request-method'] === undefined) {
        console.log(`\nHTTP REQUEST: '${item.path}'`)
        data = item.action(fixCh(request.url.slice(1)), response)
        if (data !== undefined) {
            response.write(JSON.stringify(data))
        } else {
            response.writeHead(200, utils.headers)
        }
    } else {
        console.log(`Preflight Request: ${request.headers['access-control-request-method']} ${request.url}`)
    }
    response.end()
    return data
}

module.exports = {
    createServer: createServer
}