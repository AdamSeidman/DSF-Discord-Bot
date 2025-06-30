const { copyObject } = require("logic-kit")
const logger = require("@adamseidman/logger")

const sessionDMs = []
const DEFAULT_LIMIT=100

async function getAll(channel, limit) {
    const messages = await channel?.messages?.fetch({ limit })
    return (messages || []).filter(x => x.content.length > 0).map((message) => `(${
        new Date(message.createdTimestamp).toLocaleString()}) ${
        message.author?.username}: "${message.content.trim()}"`)
}

async function getAllFromUser(userId, limit=DEFAULT_LIMIT) {
    let user = {}
    try {
        user = await require("discord").users.fetch(userId)
    } catch {
        return []
    }
    if (!user) {
        return []
    }
    let channel = user.dmChannel
    if (!channel) {
        channel = await user.createDM(true)
    }
    return await getAll(channel, limit)
}

async function getAllFromChannel(channelId, limit=DEFAULT_LIMIT) {
    const channel = require("discord").channels.cache
        .find(x => x.id == channelId)
    return await getAll(channel, limit)
}

async function getAllMessages(id, limit=DEFAULT_LIMIT) {
    return [
        ...await getAllFromUser(id, limit),
        ...await getAllFromChannel(id, limit)
    ]
}

function logMessage(msg) {
    logger.info('Received direct message.', `${msg.author.username}: ${msg.content}`)
    if (msg.author?.bot || msg.author?.id == global.bot.id) {
        return
    }
    sessionDMs.push(`${msg.author.username} (u:${msg.author?.id} ch:${msg.channelId}): ${msg.content}`)
}

function getLog() {
    return copyObject(sessionDMs)
}

module.exports = {
    getAllMessages,
    logMessage,
    getLog
}
