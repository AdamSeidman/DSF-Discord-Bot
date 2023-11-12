/**
 * Author: Adam Seidman
 * 
 * Interfaces with server-info.db
 * Deals with daily channel IDs and effects-enabled guild IDs
 * 
 * Exports:
 *     getDailyChannelsDB-
 *         Get list of channel IDs that get daily stupid facts from database.
 *     addDailyChannelDB-
 *         Add a new channel ID for facts with dsf!daily
 *     removeDailyChannelDB
 *         Remove a channel ID from dailies
 *     modifyEffectsServerDB
 *         Add OR remove a discord server from sound effects db table
 *     getEffectsServersDB
 *         List of all guild IDs that have sound effects enabled
 */

const { copyObject } = require('../../base/utils')
const db = require('../db')
const { log } = require('../../base/logger')

// Return all channel IDs in 'dailies' table
var getDailyChannels = function (clientChannels, arr) {
    db.setUpDatabases()
    let serverInfo = db.getDatabase('serverInfo')

    if (!serverInfo) {
        log.Error('No server info!', 'DB/server-info', 'getDailyChannels', serverInfo)
        return []
    }
    serverInfo.forEach('Dailies', row => {
        // Read through table
        let el = clientChannels.find(x => x.name === row.Name && x.id === row.ID)
        if (el !== undefined) {
            arr.push(el)
        }
    })
    serverInfo.close()
}

// Add channel ID to 'dailies' table
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

// Remove channel ID from 'dailies' table
var removeDailyChannel = function (channel) {
    db.setUpDatabases()
    let serverInfo = db.getDatabase('serverInfo')

    serverInfo.database.run(`DELETE FROM Dailies WHERE ID = ${channel.id}`, [], function (err) {
        if (err) {
            log.Error('Error occurred in delete from dailies.', 'DB/server-info', 'removeDailyChannels', err)
            channel.send('An error occured.')
        } else {
            channel.send('Channel removed from daily stupid facts list.') // sadness
            channel.send('(You should consider turning it back on though...)')
        }
    })

    serverInfo.close()
}

let effectsGuilds = undefined // store list locally

// Get all sound-effect-enabled servers
var getEffectsGuilds = function () {
    db.setUpDatabases()
    if (effectsGuilds === undefined) {
        let serverInfo = db.getDatabase('serverInfo')
        effectsGuilds = []
        if (!serverInfo) {
            log.Error('No server info!', 'DB/server-info', 'getEffectsGuilds', serverInfo)
            return []
        }

        serverInfo.forEach('Effects', row => effectsGuilds.push(row.ID)) // store in effectsGuilds
        serverInfo.close()
    }

    return copyObject(effectsGuilds) // Only copy local
}

getEffectsGuilds() // Setup array

// Add sound effects to server
var addEffectsServer = function (channel) {
    db.setUpDatabases()
    let serverInfo = db.getDatabase('serverInfo')

    // Warn if already set up, or add to memory if not
    if (effectsGuilds.includes(channel.guild.id)) {
        channel.send('Server is already set up for sound effects.')
    } else {
        effectsGuilds.push(channel.guild.id)
    }

    serverInfo.insert('Effects', { // Add to DB
        ID: channel.guild.id
    }, () => {
        channel.send('Server set up for sound effects!')
    })

    serverInfo.close()
}

// Remove sound effect from server
var removeEffectsServer = function (channel) {
    db.setUpDatabases()
    let serverInfo = db.getDatabase('serverInfo')
    const id = channel.guild.id

    // Warn if not set up or remove from memory if not
    if (effectsGuilds.includes(id)) {
        effectsGuilds = effectsGuilds.filter(x => x !== id)
    } else {
        channel.send('Effects are not enabled on this server.')
        return
    }

    serverInfo.database.run(`DELETE FROM Effects WHERE ID = ${channel.guild.id}`, [], function (err) {
        if (err) {
            log.Error('Error occured in delete from effects', 'DB/server-info', 'removeEffectsServer', err)
            channel.send('An error occured.')
        } else {
            // Deleted
            channel.send('Sound effects removed from server.')
        }
    })
}

// Wrapper function for adding or removing sound effects guild IDs
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