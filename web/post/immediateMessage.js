const logger = require("@adamseidman/logger")
const Discord = require("discord.js")
const { postpone } = require("logic-kit")

let client = null
postpone(() => client = require("../../discord/client").client)

function getUserById(id) {
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
    }
}

function handle(req) {
    if (typeof req.body?.id !== 'string' || typeof req.body.message !== 'string' || 
        req.body.message.trim().length < 1 && req.body.id.length) {
            return 400
    } else if (!client) {
        return 500
    }
    sendMessageTo(req.body?.id, req.body.message)
    return 202
}

module.exports = handle
