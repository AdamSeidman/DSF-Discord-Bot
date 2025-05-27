let overridden = false
let overrideMessage = ''

function setOverridden(override) {
    overridden = !!override
}

function isOverridden() {
    return overridden
}

function setOverrideMessage(msg) {
    overrideMessage = msg || ''
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
