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

var bumpCount = function (type, userId) {
    if (isNaN(userId)) return
    db.setUpDatabases()
    let stats = db.getDatabase('stats')

    let count = 0
    stats.database.each(`SELECT * FROM ${type} WHERE userId LIKE '${userId}' OR userId LIKE 0 ORDER BY count DESC`, (err, row) => {
        if (err) {
            console.error(`Error in SQL bump${type} SELECT`)
            console.error(err)
            return
        } else if (!isNaN(row.count)) {
            if (count === 0) {
                count = Number(row.count) + 1
            }
            let statement = (count === 1)? `INSERT INTO ${type} (userId, count) VALUES ('${userId}', '${count}')`
                : `UPDATE ${type} SET count='${count}' WHERE userId='${userId}'`
            stats.database.run(statement, [], err => {
                if (err) {
                    console.error(`Error in SQL bump${type}\n\r\tScript: ${statement}`)
                    console.error(err)
                }
            })
        }
    })

    stats.close()
}

var tables = ['Fact', 'Lie', 'Prius', 'Acronym', 'Effect']

var getStatistics = async function(msg, args) {
    if (msg === undefined) return
    db.setUpDatabases()
    let stats = db.getDatabase('stats')
    let result = {}

    let user = utils.matchesId(args[1])
    let userId = msg.author.id
    if (user) {
        userId = Number(user)
        user = `${(await utils.getUserById(user)).username} has`
    } else {
        user = 'You have'
    }

    tables.forEach(table => {
        stats.database.each(`SELECT * FROM ${table} WHERE userId LIKE '${userId}' OR userId LIKE 0 ORDER BY count DESC`, (err, row) => {
            if (result[table] === undefined) {
                result[table] = err? 0 : row.count
                if (Object.keys(result).length === tables.length) {
                    let builder = `${user} requested the following:`
                    tables.forEach(item => builder += `\n> ${item}: ${result[item]}`)
                    msg.reply(builder)
                    stats.close()
                }
            }
        })
    })
}

module.exports = {
    bumpCount,
    getStatistics
}
