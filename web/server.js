/**
 * Author: Adam Seidman
 * 
 * Provides functionality to set up http server with given endpoints
 * Uses connect and server-static to host pages.
 * 
 * Exports:
 *     createServer: Sets up server on given port
 *         Params-
 *             fileLocation: Directory where index.html is located
 *             endpoints: List of endpoints with their appropriate function responses
 *             port: Port on which to host the server (I use 8080 or 8081)
 */

const connect = require('connect')
const serveStatic = require('serve-static')
const utils = require('poop-sock')
const fixCh = utils.fixPathCharacters
const config = require('../client/config')
const log = require('better-node-file-logger')

// Set up server using serve-static and listen on port
var createServer = function (fileLocation, endpoints, port) {
    if (!config.options.hasWebInterface) return
    var server = connect()
    server.use(serveStatic(fileLocation))
    endpoints.forEach(item => {
        server.use(`/${item.path}`, (req, res) => {
            handleHttpRequest(item, req, res)
        })
    })
    server.listen(port)
    log.info(`Server Initialized on Port ${port}.`)
    return server
}

// On HTTP request, connect request to function
var handleHttpRequest = function (item, request, response) {
    if (!config.options.hasWebInterface) return
    let data = undefined
    if (request.headers['access-control-request-method'] === undefined) {
        log.info(`HTTP Request: ${item.path}`)
        data = item.action(fixCh(request.url.slice(1)), response)
        if (data !== undefined) {
            response.write(JSON.stringify(data))
        } else {
            response.writeHead(200, utils.webHeaders)
        }
    } else {
        log.warn(`Preflight Request: ${request.headers['access-control-request-method']}`, request.url)
    }
    response.end()
    return data
}

module.exports = {
    createServer
}