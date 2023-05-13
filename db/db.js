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

var dbList = ['serverInfo', 'randomItems', 'dsfTerms'] // List of used DBs
var db = {removeArr: []}

// Get all databases- Save to list
var setup = function () {
    if (db.removeArr === undefined) return
    for(var i = 0; i < dbList.length; i++) {
        let server = dbList[i]
        db[server] = new sqlite3.Database(`${server}.db`, (err) => {
            if (err) {
                console.error(`${server} Error:`)
                console.error(err)
                db.removeArr.unshift(i)
            } else {
                console.log(`Connected to ${server} database.`)
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
            console.log(err)
            return null
        }
    })
    // Provide basic manipulation functions
    result.close = function () {
        result.database.close((err) => {
            if (err) {
                console.log(err)
            }
        })
    }
    result.forEach = function (table, callback) {
        result.database.each(`SELECT * FROM ${table}`, (err, row) => {
            if (err) {
                console.log(`Error in reading sql (Table: ${table}) with foreach:\nRow-`)
                console.log(row)
                console.log(err)
            } else {
                callback(row)
            }
        })
    }
    result.insert = function (table, map, callback) {
        if (typeof(map) !== 'object' || Object.keys(map).length === 0) {
            console.log('Supplied map is invalid.')
        } else {
            let keys = ''
            let values = []
            Object.keys(map).forEach(item => {
                keys += `${item}, `
                values.push(map[item])
            })
            const sql = `INSERT INTO ${table} (${keys.slice(0, keys.length - 2)}) VALUES (?)`
            result.database.run(sql, [...values], err => {
                if (err) {
                    console.log('SQL Insert Error Occurred.\n')
                    console.log(err)
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