const logger = require("@adamseidman/logger")
const { TextChannel } = require("discord.js")

async function getUserById(id) {
    const client = require("discord")
    if (!id || typeof client.users?.fetch !== 'function') return
    let user = null
    try {
        user = await client.users.fetch(id)
    } catch {
        logger.error(`Could not get user by ID (${id})`, error)
    }
    return user
}

function getTextChannelById(id) {
    return require("discord").channels.cache
        .filter(x => x instanceof TextChannel)
        .find(x => x.id === id)
}

async function getMessageByUrl(url, guildId) {
    if (typeof url !== 'string') return
    const parts = url.trim().split('/')
    if (parts.length < 2) return
    const channel = await require("discord").channels.fetch(parts.at(-2))
    if (guildId && channel.guild.id != guildId) return
    try {
        return await channel?.messages.fetch(parts.at(-1))
    } catch {}
}

module.exports = {
    getUserById,
    getTextChannelById,
    getMessageByUrl
}
