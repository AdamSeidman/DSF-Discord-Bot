/**
 * Author: Adam Seidman
 * 
 * Generic framework to connect to any .db
 * Uses sqlite3
 * 
 * Exports:
 *     setUpDatabases: Connect to all given databases
 *     getDatabase: Get database object from /db
 *         Param: database name (String)
 */

const sqlite3 = require('sqlite3').verbose()
const config = require('../client/config')
const log = require('better-node-file-logger')

var dbList = ['serverInfo', 'randomItems', 'dsfTerms', 'stats'] // List of used DBs
var db = {removeArr: []}

// Get all databases- Save to list
var setup = function () {
    if (db.removeArr === undefined) return
    for(var i = 0; i < dbList.length; i++) {
        if ((dbList[i] === 'stats' && !config.options.keepsStatistics) || (dbList[i] === 'dsfTerms' && !config.options.hasAcronyms)) continue
        let server = dbList[i]
        db[server] = new sqlite3.Database(`${server}.db`, (err) => {
            if (err) {
                log.error(`Could not connect to database ${server}`, err)
                db.removeArr.unshift(i)
            } else {
                log.info(`Connected to ${server} database.`)
            }
        })
    }
    db.removeArr.forEach(index => {
        dbList = dbList.slice(0, index).concat(dbList.slice(index + 1))
    })
    delete db.removeArr
}

// Create allowed database and provide functions for sqlite3 object
var getDB = function(dbName) {
    if (!dbList.includes(dbName)) {
        return undefined // Don't create databases that haven't been defined
    }
    let result = {}
    // Create database object
    result.database = new sqlite3.Database(`${__dirname}\\${dbName}.db`, (err) => {
        if (err) {
            log.error('Could not get database', err)
            return null
        }
    })
    // Provide basic manipulation functions
    result.close = function () {
        result.database.close((err) => {
            if (err) {
                log.error('Could not close database', err)
            }
        })
    }
    result.forEach = function (table, callback, finalCallback) {
        result.database.each(`SELECT * FROM ${table}`, (err, row) => {
            if (err) {
                log.error(`Error in reading sql (Table: ${table}) with forEach`, {row: row, error: err})
            } else {
                callback(row)
            }
        }, () => {
            if (finalCallback !== undefined) {
                finalCallback()
            }
        })
    }
    result.insert = function (table, map, callback) {
        if (typeof(map) !== 'object' || Object.keys(map).length === 0) {
            log.warn('Supplied map was invalid.')
        } else {
            let keys = ''
            let values = []
            let valueString = ''
            Object.keys(map).forEach(item => {
                keys += `, ${item}`
                values.push(map[item])
                valueString += ', ?'
            })
            const sql = `INSERT INTO ${table} (${keys.slice(2)}) VALUES (${valueString.slice(2)})`
            result.database.run(sql, [...values], err => {
                if (err) {
                    log.error('SQL Insert Error Occurred', err)
                } else {
                    callback()
                }
            })
        }
    }
    return result
}

module.exports = {
    setUpDatabases: setup,
    getDatabase: getDB
}