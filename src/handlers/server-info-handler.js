const db = require('../db/db')

var getDailyChannels = function () {
    db.setUpDatabases()
    let serverInfo = db.getDatabase('serverInfo')
    if (!serverInfo) {
        console.log('Error: No server info.')
        console.log(serverInfo)
        return []
    }
    let arr = []
    serverInfo.database.all('SELECT * FROM Dailies', [], (err, rows) => {
        if (err) {
            console.error(err)
        } else {
            console.log(rows)
        }
        rows.forEach(row => {
            arr.push(row)
        })
    })
    serverInfo.close()
    return arr
}

var addDailyChannel = function (channel) {
    db.setUpDatabases()
    let serverInfo = db.getDatabase('serverInfo')

    serverInfo.database.run(`INSERT INTO Dailies (Name, ID) VALUES ('${channel.name}', '${channel.id}')`, [], function (err) {
        if (err) {
            console.log(err)
            channel.send('An error occurred.')
        } else {
            channel.send('Channel set up for daily stupid facts!')
        }
    })
}

module.exports = {
    getDailyChannelsDB: getDailyChannels,
    addDailyChannelDB: addDailyChannel
}