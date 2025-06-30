const users = require("@tables/users")

async function handle(req) {
    const user = users.get(req.user?.id)
    if (!user) {
        return 401
    }
    if (!user.is_owner) {
        return 403
    }
    let messages = []
    const directMessages = require("discord/modules/directMessages")
    if (typeof req.query.id !== 'string') {
        messages = directMessages.getLog()
    } else {
        messages = await directMessages.getAllMessages(req.query.id)
    }
    return {
        code: 200,
        data: { messages }
    }
}

module.exports = handle
