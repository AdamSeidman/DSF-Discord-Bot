/**
 * Author: Adam Seidman
 * 
 * Provides central hub to check the status of the bot and change it.
 * Override is used to send a custom message through DSF.
 */

var shouldGenerateFact = true
var overrideMessage = ''

// These two functions are the ones called in endpoints.js
var setBotOnline = function (online) {
    shouldGenerateFact = online === undefined || online.length === 0
    console.log(`Bot Online: ${shouldGenerateFact}`)
}

var setOverrideMessage = function (message) {
    overrideMessage = message
    console.log(`New Override Message: ${message}`)
}

module.exports = {
    shouldGenerateFact: () => shouldGenerateFact,
    overrideMessage: () => overrideMessage,
    setBotOnline: setBotOnline,
    setOverrideMessage: setOverrideMessage
}