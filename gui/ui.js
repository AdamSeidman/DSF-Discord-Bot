const http = require('http')
const endpoints = require('./endpoints').list
const fixCh = require('../base/utils').fixPathCharacters

var setup = function () {
    http.createServer((request, response) => {
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
            endpoint.action(command)
        }
        response.statusCode = 200
        response.end()
    }).listen(8081)

    console.log('Command Server Running on Port 8081')
}

module.exports = {
    setupCommandServer: setup
}