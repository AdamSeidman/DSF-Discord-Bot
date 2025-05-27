const { Table } = require('../database')

const table = new Table('effectsGuilds')

function hasGuild(id) {
    return table.data.map(x => x.guild_id).includes(`${id}`)
}

module.exports = {
    refresh: () => table.refresh(),
    hasGuild
}
