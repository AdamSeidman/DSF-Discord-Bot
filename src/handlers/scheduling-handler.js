const serverHandler = require('./server-info-handler')

var dailyChannels = undefined

var schedDailyChannels = function () {
    if (dailyChannels != undefined) return
    dailyChannels = serverHandler.getDailyChannelsDB()
    console.log('todo') // TODO set up scheduler
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