const { Table } = require("../database")
const logger = require("@adamseidman/logger")

const table = new Table('userStats')

function getStats(id) {
    return table.data.find(x => x.user_id == id)
}

function updateStat(msg, stat, num=1) {
    const user = (msg.author || msg.member)
    const userStats = table.data.find(x => x.user_id == user.id)
    const record = {
        user_id: user.id,
        username: user.username || user.user.username
    }
    record[stat] = (userStats?.[stat] || 0) + num
    table.client
        .from(table.name)
        .upsert(record, { onConflict: ['user_id'] })
        .then(({ error }) => {
            if (error) {
                logger.error(`Could not update stat for ${user.username} (${user.id})`, error)
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
