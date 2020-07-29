const connect = require('connect')
const serveStatic = require('serve-static')
const utils = require('../../base/utils')
const fixCh = utils.fixPathCharacters
const headers = utils.HTTPheaders

var createServer = function (fileLoc, endpoints, port) {
    var server = connect()
    server.use(serveStatic(fileLoc))
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
    if (request.headers['access-control-request-method'] === undefined) {
        console.log(`\nPOST: '${item.path}'`)
        item.action(fixCh(request.url.slice(1)))
    } else {
        console.log(`Preflight Request: ${request.headers['access-control-request-method']} ${request.url}`)
    }
    response.writeHead(200, headers)
    response.end()
}

module.exports = {
    createServer: createServer
}