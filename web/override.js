/**
 * Author: Adam Seidman
 * 
 * Provides central hub to check the status of the bot and change it.
 * Override is used to send a custom message through DSF.
 */
const config = require('../client/config')
const { log } = require('../base/logger')

var shouldGenerateFact = true
var overrideMessage = ''

// These two functions are the ones called in endpoints.js
var setBotOnline = function (online) {
    if (!config.options.allowsOverrideFacts) return
    shouldGenerateFact = online === undefined || online.length === 0 || online === false
    log.Info(`Bot Online: ${shouldGenerateFact}`, 'web/Override', 'setBotOnline')
}

var setOverrideMessage = function (message) {
    if (!config.options.allowsOverrideFacts) return
    overrideMessage = message
    log.Info('New Override Message:', 'web/Override', 'setBotOnline', message)
}

module.exports = {
    shouldGenerateFact: () => shouldGenerateFact,
    overrideMessage: () => overrideMessage,
    setBotOnline: setBotOnline,
    setOverrideMessage: setOverrideMessage
}