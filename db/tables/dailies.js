const { Table } = require("../database")
const logger = require("@adamseidman/logger")

const table = new Table('dailyChannels')

function getAll() {
    return table.data.filter(x => x.is_enabled).map((row) => {
        return {
            guildId: row.guild_id,
            channelId: row.channel_id
        }
    })
}

async function setChannel(msg, enabled) {
    if (!msg?.channel?.id) return false
    try {
        const { error } = await table.client
            .from(table.name)
            .upsert({
                channel_id: msg.channel.id,
                guild_id: msg.guild.id,
                last_updated: 'NOW()',
                channel_name: msg.channel.name,
                guild_name: msg.guild.name,
                is_enabled: enabled
            }, { onConflict: ['channel_id'] })
        if (error) {
            throw error
        }
    } catch (error) {
        logger.error(`Could not set daily channel (${msg.channel.id || '??'}) to [${enabled}]`, error)
        return false
    }
    await table.refresh()
    return true
}

module.exports = {
    refresh: () => table.refresh(),
    getAll,
    setChannel
}
