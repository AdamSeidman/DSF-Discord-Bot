const logger = require("@adamseidman/logger")

let overridden = false
let overrideMessage = ''

function setOverridden(override) {
    overridden = !!override
    logger.debug(`Overriden set to: ${overridden}`)
}

function isOverridden() {
    return overridden
}

function setOverrideMessage(msg) {
    overrideMessage = msg || ''
    if (msg) {
        logger.debug(`Override message set to ${msg}`)
    }
}

function getOverrideMessage() {
    return overrideMessage
}

module.exports = {
    setOverridden,
    isOverridden,
    setOverrideMessage,
    getOverrideMessage
}
