const users = require("../../db/tables/users")
const override = require("../../fact/override")

function handle(req) {
    const user = users.get(req.user?.id)
    if (!user) {
        return { code: 401 }
    }
    if (!user.is_owner) {
        return { code: 403 }
    }
    const message = req.body?.message
    if (message === null) {
        override.setOverridden(false)
    } else if (typeof message === 'string' && message.trim().length > 0) {
        override.setOverrideMessage(message.trim())
        override.setOverridden(true)
    } else {
        return 400
    }
    return 200
}

module.exports = handle
