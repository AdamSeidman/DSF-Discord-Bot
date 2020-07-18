const sqlite3 = require('sqlite3').verbose()

const DB_LIST = ['serverInfo']
var db = {}

var setup = function () {
    if (db[DB_LIST[0]] === undefined) {
        DB_LIST.forEach(server => {
            db[server] = new sqlite3.Database(`${server}.db`, (err) => {
                if (err) {
                    console.log('fail')
                } else {
                    console.log(`Connected to ${server} Database.`)
                }
            })
        })
    }
}

module.exports = {
    setUpDatabases: setup
}