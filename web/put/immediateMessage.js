const Discord = require("discord.js")
const users = require("@tables/users")
const logger = require("@adamseidman/logger")

function getUserById(id) {
    const { client } = require("@discord/client")
    return new Promise((resolve, reject) => {
        client.users.fetch(id)
            .then((user) => {
                resolve(user)
            })
            .catch((error) => {
                logger.error(`Could not getUserById (${id})`, error)
                reject(error)
            })
    })
}

function getChannelById(id) {
    const { client } = require("@discord/client")
    return client?.channels.cache
        .filter(x => x instanceof Discord.TextChannel)
        .find(x => x.id === id)
}

async function sendMessageTo(id, message) {
    try {
        let channel = getChannelById(id)
        if (!channel) {
            channel = await getUserById(id)
        }
        if (!channel) {
            logger.warn('Supplied ID for immediate message was invalid.', message)
        } else {
            logger.info('Sending immediate message.', `(${id}) ${message}`)
            channel.send(message)
        }
    } catch (error) {
        logger.error('Error in sendMessageTo', error)
        return 500
    }
}

function handle(req) {
    const user = users.get(req.user?.id)
    if (!user) {
        return { code: 401 }
    }
    if (!user.is_owner) {
        return { code: 403 }
    }
    if (typeof req.body?.id !== 'string' || typeof req.body.message !== 'string' || 
        req.body.message.trim().length < 1 && req.body.id.length) {
            return 400
    }
    return sendMessageTo(req.body.id, req.body.message) || 202
}

module.exports = handle
