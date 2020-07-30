const localEndpoints = require('../web/local/endpoints').list
const remoteEndpoints = require('../web/remote/endpoints').list
const { createServer } = require('../web/shared/server')

const LOCAL_PORT = 8080
const REMOTE_PORT = 8081

var serverMaps = [
    {
        fileLoc: `${__dirname}\\..\\web\\local\\ui\\`,
        endpoints: localEndpoints,
        port: LOCAL_PORT
    },
    {
        fileLoc: `${__dirname}\\..\\web\\remote\\ui\\`,
        endpoints: remoteEndpoints,
        port: REMOTE_PORT
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