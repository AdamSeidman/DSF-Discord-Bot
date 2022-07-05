/**
 * Author: Adam Seidman
 * 
 * Handles sending out daily stupid facts
 * 
 * Exports:
 *     scheduleDailyChannels- Schedule fact
 *     addDailyChannel- Add channel to list of dailies
 *     removeDailyChannel- Remove channel from list of dailies
 */

const serverHandler = require('../db/handlers/server-info')
const schedule = require('node-schedule')
const utils = require('./facts')

var dailyChannels = undefined

// Schedule all daily channels
var schedDailyChannels = function (clientChannels) {
    if (dailyChannels !== undefined) return
    dailyChannels = []
    serverHandler.getDailyChannelsDB(clientChannels, dailyChannels) // Get channels
    schedule.scheduleJob({hour: 18, minute: 13}, async () => { // 6:13 PM
        // Send out fact at scheduled time
        let fact = utils.getRandomFact()
        dailyChannels.forEach(channel => {
            channel.send(`It's time for the fact of the day!\nAre you ready? Here it is:\n${fact}`)
        })
    })
}

// Add a channel to list of daily channels
var addDailyChannel = function (channel) {
    if (dailyChannels.find(item => {
        return channel.id === item.id
    }) !== undefined) {
        // Channel already in dailyChannels list
        channel.send('Channel already set up.')
    } else {
        // Add to array
        serverHandler.addDailyChannelDB(channel)
        dailyChannels.push(channel)
    }
}

// Remove a channel from list of daily channels
var removeDailyChannel = function (channel) {
    var index = 0
    const foundChannel = dailyChannels.find((item, i) => {
        if (channel.id === item.id) {
            index = i
            return true
        }
        return false
    }) !== undefined
    if (foundChannel) {
        // Remove from database
        serverHandler.removeDailyChannelDB(channel)
        dailyChannels = dailyChannels.slice(0, index).concat(dailyChannels.slice(index + 1))
    } else {
        // Was never set up
        channel.send('Channel not set up for daily stupid facts.')
    }
}

module.exports = {
    scheduleDailyChannels: schedDailyChannels,
    addDailyChannel: addDailyChannel,
    removeDailyChannel: removeDailyChannel
}   