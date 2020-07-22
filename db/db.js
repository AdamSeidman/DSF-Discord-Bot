const sqlite3 = require('sqlite3').verbose()

var dbList = ['serverInfo', 'randomItems']
var db = {removeArr: []}

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

var getDB = function(dbName) {
    if (!dbList.includes(dbName)) {
        return undefined
    }
    let result = {}
    result.database = new sqlite3.Database(`${__dirname}\\${dbName}.db`, (err) => {
        if (err) {
            console.log(err)
            return null
        }
    })
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
    return result
}

module.exports = {
    setUpDatabases: setup,
    getDatabase: getDB
}