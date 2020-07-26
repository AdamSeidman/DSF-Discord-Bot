const http = require('http')
const endpoints = require('./endpoints').list

var setup = function () {
    http.createServer((request, response) => {
        let pathReq = request.url.slice(1)
        console.log(`\nPOST: '${pathReq}'`)
        let endpoint = endpoints.find(x => x.path === pathReq)
        if (endpoint === undefined) {
            console.log('Path not found.')
        } else {
            endpoint.action()
        }
        response.statusCode = 200
        response.end()
    }).listen(8081)

    console.log('Command Server Running on Port 8081')
}

module.exports = {
    setupCommandServer: setup
}