const config = require('../client/config')
const log = require('node-file-logger')

module.exports = {
    initLogging: function () {
        log.SetUserOptions(config.loggerOptions)
        log.Info('Logging Initialized', 'Logger')
    },
    log
}
