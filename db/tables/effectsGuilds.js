const { Table } = require("../database")
const logger = require("@adamseidman/logger")

const table = new Table('effectsGuilds')

function hasGuild(id) {
    return table.data.some(x => x.is_enabled && x.guild_id === `${id}`)
}

async function setGuild(id, enabled, guildName) {
    const result = {
        error: null,
        failed: false
    }
    if (!id) {
        result.error = true
        return result
    } else if (hasGuild(id) === (!!enabled)) {
        result.failed = true
        return result
    }
    try {
        const { error } = await table.client
            .from(table.name)
            .upsert({
                guild_id: id,
                last_updated: 'NOW()',
                is_enabled: !!enabled,
                guild_name: guildName
            }, { onConflict: ['guild_id'] })
        if (error) {
            throw error
        }
    } catch (error) {
        logger.error(`Could not set guild (${id} - ${guildName}) effects enabled to [${enabled}]`, error)
        result.error = error
    }
    await table.refresh()
    return result
}

module.exports = {
    refresh: () => table.refresh(),
    hasGuild,
    setGuild
}
