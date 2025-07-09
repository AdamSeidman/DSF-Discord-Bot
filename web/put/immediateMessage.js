const users = require("@tables/users")
const logger = require("@adamseidman/logger")
const { getUserById, getTextChannelById } = require("discord/modules/helpers")

async function sendMessageTo(id, message) {
    try {
        let channel = getTextChannelById(id)
        if (!channel) {
            channel = await getUserById(id)
        }
        if (!channel) {
            logger.warn('Supplied ID for immediate message was invalid.', message)
        } else {
            logger.info('Sending immediate message.', `(${id}) ${message}`)
            await channel.send(message)
        }
    } catch (error) {
        logger.error('Error in sendMessageTo', error)
    }
}

function handle(req) {
    const user = users.get(req.user?.id)
    if (!user) {
        return 401
    }
    if (!user.is_owner) {
        return 403
    }
    if (typeof req.body?.id !== 'string' || typeof req.body.message !== 'string' || 
        req.body.message.trim().length < 1 && req.body.id.length) {
            return 400
    }
    sendMessageTo(req.body.id, req.body.message)
    return 202
}

module.exports = handle
