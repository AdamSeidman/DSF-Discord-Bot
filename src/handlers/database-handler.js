const sqlite3 = require('sqlite3').verbose()

const DB_LIST = ['serverInfo']
var db = {}

var setup = function () {
    if (db[DB_LIST[0]] === undefined) {
        DB_LIST.forEach(server => {
            db[server] = new sqlite3.Database(`../../db/${server}.db`, (err) => {
                if (err) {
                    //console.error(err.message)
                    //console.error(err)
                } else {
                    console.log(`Connected to ${server} Database.`)
                }
            })
        })
    }
    let dbb = new sqlite3.Database('../../db/chinook.db', (err) => {
        if (err) {
            console.error(err)
        } else {
            console.log('yeeee')
        }
    })
}

module.exports = {
    setUpDatabases: setup
}