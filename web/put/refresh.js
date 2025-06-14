const users = require("@tables/users")
const { postpone } = require("logic-kit")
const logger = require("@adamseidman/logger")
const { forceRefresh } = require("../../db/database")

async function handle(req) {
    const user = users.get(req.user?.id)
    if (!user) {
        return { code: 401 }
    }
    if (!user.can_restart_bot) {
        return { code: 403 }
    }
    logger.info('Forcing DB refresh...')
    postpone(forceRefresh)
    return 202
}

module.exports = handle
