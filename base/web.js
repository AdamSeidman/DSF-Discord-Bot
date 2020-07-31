const { localEndpoints, remoteEndpoints, sharedEndpoints } = require('../web/endpoints')
const { createServer } = require('../web/server')

const LOCAL_PORT = 8081
const REMOTE_PORT = 8080

var serverMaps = [
    {
        fileLoc: `${__dirname}\\..\\web\\ui\\`,
        endpoints: localEndpoints,
        port: LOCAL_PORT
    },
    {
        fileLoc: `${__dirname}\\..\\web\\ui\\shared`,
        endpoints: remoteEndpoints,
        port: REMOTE_PORT
    }
]

var setup = function () {
    serverMaps.forEach(map => {
        map.server = createServer(map.fileLoc, map.endpoints.concat(sharedEndpoints), map.port)
    })
}

module.exports = {
    setupWebServers: setup
}