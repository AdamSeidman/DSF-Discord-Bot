const { Table } = require('../database')
const logger = require('../../utils/logger')

const table = new Table('effectsGuilds')

function hasGuild(id) {
    return table.data.filter(x => x.is_enabled).map(x => x.guild_id).includes(`${id}`)
}

function setGuild(id, enabled, guildName) {
    if (!id) return false
    try {
        const { error } = table.client
            .from(table.name)
            .upsert({
                guild_id: id,
                last_updated: 'NOW()',
                is_enabled: !!enabled,
                guild_name: guildName
            })
            .onConflict('guild_id')
        if (error) {
            throw error
        }
    } catch (error) {
        logger.error(`Could not set guild (${id} - ${guildName}) effects enabled to [${enabled}]`, error)
        return false
    }
    table.refresh()
    return true
}

module.exports = {
    refresh: () => table.refresh(),
    hasGuild,
    setGuild
}
