const logger = require("@adamseidman/logger")

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

module.exports = {
    getUserById,
    getTextChannelById
}
