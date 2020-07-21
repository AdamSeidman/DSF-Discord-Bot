const db = require('../db/db')

var getDailyChannels = function (clientChannels, arr) {
    db.setUpDatabases()
    let serverInfo = db.getDatabase('serverInfo')
    if (!serverInfo) {
        console.log('Error: No server info.')
        console.log(serverInfo)
        return []
    }
    serverInfo.forEach('Dailies', row => {
        let el = clientChannels.find(x => x.name === row.Name && x.id === row.ID)
        if (el !== undefined) {
            arr.push(el)
        }
    })
    serverInfo.close()
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
    
    serverInfo.close()
}

var removeDailyChannel = function (channel) {
    db.setUpDatabases()
    let serverInfo = db.getDatabase('serverInfo')

    serverInfo.database.run(`DELETE FROM Dailies WHERE ID = ${channel.id}`, [], function (err) {
        if (err) {
            console.log(err)
            console.log('Error occured in delete from dailies')
        } else {
            channel.send('Channel removed from daily stupid facts list.')
            channel.send('(You should consider turning it back on though...)')
        }
    })

    serverInfo.close()
}

module.exports = {
    getDailyChannelsDB: getDailyChannels,
    addDailyChannelDB: addDailyChannel,
    removeDailyChannelDB: removeDailyChannel
}