const serverHandler = require('../db/handlers/server-info')
const schedule = require('node-schedule')
const utils = require('./facts')

var dailyChannels = undefined

var schedDailyChannels = function (clientChannels) {
    if (dailyChannels !== undefined) return
    dailyChannels = []
    serverHandler.getDailyChannelsDB(clientChannels, dailyChannels)
    schedule.scheduleJob({hour: 18, minute: 13}, async () => {
        let fact = utils.getRandomFact()
        dailyChannels.forEach(channel => {
            channel.send(`It's time for the fact of the day!\nAre you ready? Here it is:\n${fact}`)
        })
    })
}

var addDailyChannel = function (channel) {
    if (dailyChannels.find(item => {
        return channel.id === item.id
    }) !== undefined) {
        channel.send('Channel already set up.')
    } else {
        serverHandler.addDailyChannelDB(channel)
        dailyChannels.push(channel)
    }
}

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
        serverHandler.removeDailyChannelDB(channel)
        dailyChannels = dailyChannels.slice(0, index).concat(dailyChannels.slice(index + 1))
    } else {
        channel.send('Channel not set up for daily stupid facts.')
    }
}

module.exports = {
    scheduleDailyChannels: schedDailyChannels,
    addDailyChannel: addDailyChannel,
    removeDailyChannel: removeDailyChannel
}   