const endpoints = require('../web/local/endpoints').list
const { createServer } = require('../web/shared/server')

const PORT = 8080

var serverMaps = [
    {
        fileLoc: `${__dirname}\\..\\web\\local\\ui\\`,
        endpoints: endpoints,
        port: PORT
    }
]

var setup = function () {
    serverMaps.forEach(map => {
        map.server = createServer(map.fileLoc, map.endpoints, map.port)
    })
}

module.exports = {
    setupWebServers: setup
}