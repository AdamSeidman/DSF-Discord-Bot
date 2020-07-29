const http = require('http')
const endpoints = require('./endpoints').list
const utils = require('../base/utils')
const fixCh = utils.fixPathCharacters
const headers = utils.HTTPheaders

var setup = function () {
    http.createServer((request, response) => {
        if (request.headers['access-control-request-method'] === undefined) {
            let pathReq = request.url.slice(1)
            let command = undefined
            if (pathReq.includes('/')) {
                command = fixCh(pathReq.slice(pathReq.indexOf('/') + 1))
                pathReq = pathReq.slice(0, pathReq.indexOf('/'))
            }
            console.log(`\nPOST: '${pathReq}'`)
            let endpoint = endpoints.find(x => x.path === pathReq)
            if (endpoint === undefined) {
                console.log('Path not found.')
            } else {
                endpoint.action(command, response)
            }
        } else {
            console.log('')
            console.log(`Preflight Request: ${request.headers['access-control-request-method']} ${request.url}`)
        }
        response.writeHead(200, headers)
        response.end()
    }).listen(8081)

    console.log('Command Server Running on Port 8081')
}

module.exports = {
    setupCommandServer: setup
}