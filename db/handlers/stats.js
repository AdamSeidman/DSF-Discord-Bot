/**
 * Author: Adam Seidman
 * 
 * Interfaces with stats.db
 * Deals with tracking user statistics
 * 
 * Exports:
 *     bumpCount-
 *         Increase specific user statistic by one.
 *         Will add the user to the database if not already there.
 *     getStatistics-
 *         Replies to user message with their statistic counts.
 */

const db = require('../db')
const utils = require('../../base/utils')
const { getEffectsServersDB } = require('./server-info')
const config = require('../../client/config')
const log = require('better-node-file-logger')

var bumpCount = function (type, userId, times) {
    if (!config.options.keepsStatistics) return

    if (isNaN(userId)) return
    db.setUpDatabases()
    let stats = db.getDatabase('stats')

    if (times === undefined) {
        times = 1
    }

    let count = 0
    stats.database.each(`SELECT * FROM ${type} WHERE userId LIKE '${userId}' OR userId LIKE 0 ORDER BY count DESC`, (err, row) => {
        if (err) {
            log.error(`Error in SQL bump${type} SELECT`, err)
            return
        } else if (!isNaN(row.count)) {
            if (count === 0) {
                count = Number(row.count) + times
            }
            let statement = (count === 1)? `INSERT INTO ${type} (userId, count) VALUES ('${userId}', '${count}')`
                : `UPDATE ${type} SET count='${count}' WHERE userId='${userId}'`
            stats.database.run(statement, [], err => {
                if (err) {
                    log.error(`Error in SQL bump${type} (run)`, {script: statement, error: err})
                }
            })
        }
    })
    stats.close()
}

var tables = ['Fact', 'Lie', 'Prius', 'Acronym', 'Effect']

var getStatistics = async function(msg, args) {
    if (!config.options.keepsStatistics) {
        msg.reply('Statistics not available.')
        return
    }

    if (msg === undefined) return
    db.setUpDatabases()
    let stats = db.getDatabase('stats')
    let result = {}

    let user = utils.matchesId(args[1])
    let userId = msg.member.id
    if (user) {
        userId = user
        try {
            user = `${(await utils.getUserById(user)).username} has`
        } catch (err) {
            log.warn('Unrecognized user had stats requested.')
            msg.reply('The requested user is unknown.')
            return
        }
    } else {
        user = 'You have'
    }

    let isEffectsGuild = getEffectsServersDB().includes(`${msg.guild.id}`)
    let filteredTables = tables.filter(x => isEffectsGuild || x !== 'Effect')

    filteredTables.forEach(table => {
        stats.database.each(`SELECT * FROM ${table} WHERE userId LIKE '${userId}' OR userId LIKE 0 ORDER BY count DESC`, (err, row) => {
            if (result[table] === undefined) {
                result[table] = err? 0 : row.count
                if (Object.keys(result).length === filteredTables.length) {
                    let builder = `${user} requested the following:`
                    filteredTables.forEach(item => builder += `\n> ${item}: ${result[item]}`)
                    msg.reply(builder)
                }
            }
        })
    })
    stats.close()
}

module.exports = {
    bumpCount,
    getStatistics
}
