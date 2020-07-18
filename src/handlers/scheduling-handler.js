const serverHandler = require('./server-info-handler')
const schedule = require('node-schedule')
const utils = require('../fact_gen/fact-utilities')

var dailyChannels = undefined

var schedDailyChannels = function (clientChannels) {
    if (dailyChannels !== undefined) return
    dailyChannels = []
    serverHandler.getDailyChannelsDB(clientChannels, dailyChannels)
    schedule.scheduleJob({hour: 18, minute: 13}, async () => {
        let fact = utils.getRandomFact()
        dailyChannels.forEach(channel => {
            channel.send(`Its 6:13 PM, that means it's time for the stupid fact of the day!\nAre you ready? Here it is:\n${fact}`)
        })
    })
}

var addDailyChannel = function(channel) {
    let foundChannel = false
    dailyChannels.map(x => x.ID).forEach(item => {
        if (channel.id === item) {
            foundChannel = true
            return
        }
    })
    if (foundChannel) {
        channel.send('Channel already set up.')
    } else {
        serverHandler.addDailyChannelDB(channel)
    }
}

module.exports = {
    scheduleDailyChannels: schedDailyChannels,
    addDailyChannel: addDailyChannel
}   