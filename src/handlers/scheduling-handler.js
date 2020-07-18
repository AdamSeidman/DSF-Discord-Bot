const serverInfoHandler = require('./server-info-handler')

var dailyChannels = undefined

var schedDailyChannels = function () {
    if (dailyChannels != undefined) return
    dailyChannels = serverInfoHandler.getDailyChannels()
    console.log('todo') // TODO set up scheduler
}

var isChannelScheduled = function (channel) {
    let foundChannel = false
    dailyChannels.map(x => x.id).forEach(item => {
        if (channel.id === item) {
            foundChannel = true
            return
        }
    })
    return foundChannel
}

module.exports = {
    scheduleDailyChannels: schedDailyChannels,
    isChannelScheduled: isChannelScheduled
}   