const db = require('../db')

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

    serverInfo.insert('Dailies', {
        Name: channel.name,
        ID: channel.id
    }, () => {
        channel.send('Channel set up for daily stupid facts!')
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
            channel.send('An error occured.')
        } else {
            channel.send('Channel removed from daily stupid facts list.')
            channel.send('(You should consider turning it back on though...)')
        }
    })

    serverInfo.close()
}

let effectsGuilds = undefined

var getEffectsGuilds = function () {
    db.setUpDatabases()
    if (effectsGuilds === undefined) {
        let serverInfo = db.getDatabase('serverInfo')
        effectsGuilds = []
        if (!serverInfo) {
            console.log('Error: No server info.')
            console.log(serverInfo)
            return []
        }

        serverInfo.forEach('Effects', row => effectsGuilds.push(row.ID))
        serverInfo.close()
    }

    return JSON.parse(JSON.stringify(effectsGuilds))
}

getEffectsGuilds() // Setup array

var addEffectsServer = function (channel) {
    db.setUpDatabases()
    let serverInfo = db.getDatabase('serverInfo')

    if (effectsGuilds.includes(channel.guild.id)) {
        channel.send('Server is already set up for sound effects.')
    } else {
        effectsGuilds.push(channel.guild.id)
    }

    serverInfo.insert('Effects', {
        ID: channel.guild.id
    }, () => {
        channel.send('Server set up for sound effects!')
    })

    serverInfo.close()
}

var removeEffectsServer = function (channel) {
    db.setUpDatabases()
    let serverInfo = db.getDatabase('serverInfo')
    const id = channel.guild.id

    if (effectsGuilds.includes(id)) {
        effectsGuilds = effectsGuilds.filter(x => x !== id)
    } else {
        channel.send('Effects are not enabled on this server.')
        return
    }

    serverInfo.database.run(`DELETE FROM Effects WHERE ID = ${channel.guild.id}`, [], function (err) {
        if (err) {
            console.log(err)
            console.log('Error occured in delete from effects.')
            channel.send('An error occured.')
        } else {
            channel.send('Sound effects remove from server.')
        }
    })
}

var addOrRemoveEffectsServer = function (channel, addEffects) {
    if (addEffects) addEffectsServer(channel)
    else removeEffectsServer(channel)
}

module.exports = {
    getDailyChannelsDB: getDailyChannels,
    addDailyChannelDB: addDailyChannel,
    removeDailyChannelDB: removeDailyChannel,
    modifyEffectsServerDB: addOrRemoveEffectsServer,
    getEffectsServersDB: getEffectsGuilds
}