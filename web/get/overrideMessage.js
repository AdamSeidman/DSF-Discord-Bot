const { isOverridden, getOverrideMessage } = require("../../fact/override")

function handle(req, res) {
    return {
        code: 200,
        override: isOverridden()? (getOverrideMessage() || '') : null
    }
}

module.exports = handle
