const { Table } = require("../database")
const logger = require("../../utils/logger")

const table = new Table('userStats')

function getStats(id) {
    return table.data.find(x => x.user_id == id)
}

function updateStat(msg, stat, num=1) {
    const user = table.data.find(x => x.user_id == msg.member.id)
    const record = {
        user_id: msg.member.id,
        username: msg.member.name || msg.author.username
    }
    record[stat] = (user?.[stat] || 0) + num
    table.client
        .from(table.name)
        .upsert(record, { onConflict: ['user_id'] }) // TODO Match other onconflicts to this
        .then(({ error }) => {
            if (error) {
                logger.error(`Could not update stat for ${user.username} (${user.user_id})`, error)
            } else {
                table.refresh()
            }
        })
}

module.exports = {
    refresh: () => table.refresh(),
    getStats,
    updateStat
}
