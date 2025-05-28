const { Table } = require('../database')
const logger = require('../../utils/logger')

const table = new Table('dailyChannels')

function getAll() {
    return table.data.filter(x => x.is_enabled).map((row) => {
        return {
            guildId: row.guild_id,
            channelId: row.channel_id
        }
    })
}

function setChannel(msg, enabled) {
    if (!msg?.channel?.id) return false
    try {
        const { error } = table.client
            .from(table.name)
            .upsert({
                channel_id: msg.channel.id,
                guild_id: msg.guild.id,
                last_updated: 'NOW()',
                channel_name: msg.channel.name,
                guild_name: msg.guild.name,
                is_enabled: enabled
            })
            .onConflict('channel_id')
    } catch (error) {
        logger.error(`Could not set daily channel (${msg.channel.id || '??'}) to [${enabled}]`, error)
    }
}

module.exports = {
    refresh: () => table.refresh(),
    getAll,
    setChannel
}
