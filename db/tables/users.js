const { Table } = require("../database")
const logger = require("@adamseidman/logger")

let users = []
const table = new Table('webUsers', (tbl) => users = tbl.data)

async function login(discordData) {
    if (!discordData) return
    let user = users.find(x => x.discord_id == discordData.id)
    if (user) {
        logger.info(`Logging in user ${user.username}`, discordData)
        const { error } = await table.client
            .from(table.name)
            .update({ last_login: 'NOW()' })
            .eq('discord_id', discordData.id)
        if (error) {
            logger.error('Error logging in user!', error)
        } else {
            return user
        }
    } else {
        user = {
            discord_id: discordData.id,
            username: discordData.username || '(Unknown)'
        }
        logger.info(`Registering new user (${user.username})`, user)
        const { data, error } = await table.client
            .from(table.name)
            .insert(user)
            .select()
        if (error || data.length !== 1) {
            logger.error('Error registering user!', error || '[no return data]')
        } else {
            user = data[0]
            users.push(user)
            return user
        }
    }
}

async function refresh() {
    await table.refresh()
    users = table.data
}

module.exports = {
    refresh,
    login
}
