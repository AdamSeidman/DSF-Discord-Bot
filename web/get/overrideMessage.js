const { isOverridden, getOverrideMessage } = require("@facts/override")

function handle() {
    return {
        code: 200,
        override: isOverridden()? (getOverrideMessage() || '') : null
    }
}

module.exports = handle
