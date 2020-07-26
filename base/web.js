const connect = require('connect')
const serveStatic = require('serve-static')
const { setupCommandServer } = require('../gui/ui')

var setup = function () {
    connect().use(serveStatic(`${__dirname}\\..\\http\\`)).listen(8080, () => {
        console.log('UI Server Running on Port 8080.')
    })
    setupCommandServer()
}

module.exports = {
    setupWebServers: setup
}