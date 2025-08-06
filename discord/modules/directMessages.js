const logger = require("@adamseidman/logger")
const { getUserById } = require("discord/modules/helpers")
const { userMention, MessageType } = require("discord.js")
const { copyObject, matchesDiscordId } = require("logic-kit")

const sessionDMs = []
const DEFAULT_LIMIT = 100
const MESSAGE_NOTICE_TEXT = 'Received message from '

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
    logger.info('Received direct message.', `${msg.author?.username}: ${msg.content}`)
    if (!msg.author || msg.author.bot || !global.bot || msg.author.id == global.bot.id) return
    sessionDMs.push(`${msg.author.username} (u:${msg.author.id} ch:${msg.channelId}): ${msg.content}`)
}

async function handleOwnerMessage(msg) {
    if (msg.type === MessageType.Reply && msg.content?.trim().length > 0) {
        const originalMsg = await msg.fetchReference()
        if (!originalMsg.content?.startsWith(MESSAGE_NOTICE_TEXT)) return
        const userId = matchesDiscordId(originalMsg.content.slice(MESSAGE_NOTICE_TEXT.length).split(' ')[0])
        if (userId) {
            const user = await getUserById(userId)
            user?.send(msg.content.trim())
        }
    }
}

function handleDM(msg) {
    logMessage(msg)
    if (!global.owner?.id || !msg.author?.id) return
    if (global.owner.id === msg.author.id) {
        handleOwnerMessage(msg)
            .catch((error) => {
                logger.error('Error handling owner message.', error)
            })
    } else {
        global.owner
            .send(`${MESSAGE_NOTICE_TEXT}${userMention(msg.author?.id)} (${
                msg.author?.username}): "${msg.content}"`)
            .catch((error) => {
                logger.warn('Could not forward DM to owner.', error)
            })
    }
}

function getLog() {
    return copyObject(sessionDMs)
}

module.exports = {
    getAllMessages,
    handleDM,
    getLog
}
