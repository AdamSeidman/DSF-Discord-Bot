const Discord = require("discord.js")
const scheduler = require("node-schedule")
const logger = require("@adamseidman/logger")
const { isOverridden } = require("./override")
const { probabilityCheck } = require("logic-kit")
const { generateFact } = require("./construction")
const staticFacts = require("../db/tables/staticFacts")

let dailyChannels = []
let clientChannels = []

function scheduleDailyChannels(channelIds) {
    clientChannels = require("../discord/client")
        .client.channels.cache.filter(x => x instanceof Discord.TextChannel)
    clientChannels = [...clientChannels].map(x => x[1])
    dailyChannels.push(...clientChannels.filter(x => channelIds.includes(`${x.id}`)))
    scheduler.scheduleJob({
        hour: process.dsf.dailyFactHour,
        minute: process.dsf.dailyFactMinute,
        second: process.dsf.dailyFactSecond
    }, () => {
        const overridden = isOverridden()
        const shouldDoStatic = probabilityCheck(process.dsf.staticFactFrequency)
        let fact = 'DAILY_FACT_ERROR'
        let qualifier = overridden? ' (Overridden)' : '...' // TODO test
        if (shouldDoStatic && !overridden) {
            fact = staticFacts.getAndMark() // TODO test
            qualifier = ' (Static!)'
        } else {
            fact = generateFact()
        }
        logger.info(`Sending daily fact${qualifier}`, fact)
        dailyChannels.forEach((channel) => {
            try {
                channel.send(`It's time for the fact of the day!\nAre you ready? Here it is:\n${fact}`)
            } catch (error) {
                logger.error(`Could not send daily fact to '${channel.name}' (${channel.id})`, error)
            }
        })
    })
    logger.debug(`Scheduled daily facts job for ${dailyChannels.length} channel(s).`)
}

function addDailyChannel(channel) {
    if (dailyChannels.find(x => x.id == channel.id) === undefined) {
        logger.info(`Adding new daily fact channel to schedule. (${channel.id})`, channel.name)
        dailyChannels.push(channel)
        return true
    } else {
        logger.warn('Tried to re-add daily channel to schedule.', channel.name)
        return false
    }
}

function removeDailyChannel(channel) {
    const startingLength = dailyChannels.length
    dailyChannels = dailyChannels.filter(x => x.id != channel.id)
    if (dailyChannels.length === startingLength) {
        logger.warn(`Tried to un-schedule non-daily channel (${channel.id})`, channel.name)
        return false
    } else {
        logger.info(`Removed daily channel from schedule (${channel.id})`, channel.name)
        return true
    }
}

module.exports = {
    scheduleDailyChannels,
    addDailyChannel,
    removeDailyChannel
}
