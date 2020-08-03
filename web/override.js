var shouldGenerateFact = true
var overrideMessage = ''

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