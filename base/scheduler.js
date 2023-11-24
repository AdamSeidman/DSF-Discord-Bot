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
const { randomNumber } = require('poop-sock')
const config = require('../client/config')
const log = require('better-node-file-logger')

var dailyChannels = undefined

// Schedule all daily channels
var scheduleDailyChannels = function (clientChannels) {
    if (dailyChannels !== undefined) return
    dailyChannels = []
    serverHandler.getDailyChannelsDB(clientChannels, dailyChannels) // Get channels
    schedule.scheduleJob({hour: config.constants.dailyFactHour, minute: config.constants.dailyFactMinute, second: config.constants.dailyFactSecond}, async () => {
        // Send out fact at scheduled time
        let fact = utils.getRandomFact(false, true)
        log.info('Sending daily fact...', fact)
        dailyChannels.forEach(channel => {
            channel.send(`${config.constants.dailyFactMessage}${fact}`)
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
        log.info('Adding channel to daily fact list.', channel.id)
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
        log.info('Removing channel to daily fact list.', channel.id)
        serverHandler.removeDailyChannelDB(channel)
        dailyChannels = dailyChannels.slice(0, index).concat(dailyChannels.slice(index + 1))
    } else {
        // Was never set up
        channel.send('Channel not set up for daily stupid facts.')
    }
}

// Run generic task within random timeframe
var genericReschedule = function (task, minSeconds, maxSeconds) {
    let date = new Date()
    let seconds = minSeconds + randomNumber(maxSeconds - minSeconds)
    date.setSeconds(date.getSeconds() + seconds)
    schedule.scheduleJob(date, async () => {
        task()
        genericReschedule(task, minSeconds, maxSeconds)
    })
}

module.exports = {
    scheduleDailyChannels,
    addDailyChannel,
    removeDailyChannel,
    genericReschedule
}   