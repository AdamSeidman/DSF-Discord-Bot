/**
 * Author: Adam Seidman
 * 
 * Sets up web UI's on ports 8080 and 8081 for interfacing with DSF
 * Mine is set up so 8081 is the 'admin' port
 * Port 8080 is general usage (for the people that know about it) and is 
 *     forwarded out so other people out of network can use it.
 * 
 * Exports:
 *     setup()
 */

const { localEndpoints, remoteEndpoints, sharedEndpoints } = require('../web/endpoints')
const { createServer } = require('../web/server')

const LOCAL_PORT = 8081
const REMOTE_PORT = 8080

// Can create more maps if there are more UIs
var serverMaps = [
    {
        fileLocation: `${__dirname}\\..\\web\\ui\\`,
        endpoints: localEndpoints,
        port: LOCAL_PORT
    },
    {
        fileLocation: `${__dirname}\\..\\web\\ui\\shared`,
        endpoints: remoteEndpoints,
        port: REMOTE_PORT
    }
]

// Run everything using provided libraries in ./web
var setup = function () {
    serverMaps.forEach(map => {
        map.server = createServer(map.fileLocation, map.endpoints.concat(sharedEndpoints), map.port)
    })
}

module.exports = {
    setupWebServers: setup
}