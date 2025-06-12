const Discord = require("discord.js")
const storage = require('node-persist')
const scheduler = require("node-schedule")
const logger = require("@adamseidman/logger")
const staticFacts = require("../db/tables/staticFacts")
const { generateFact, generateLie } = require("./construction")
const { probabilityCheck, isAprilFools } = require("logic-kit")

let dailyChannels = []
let clientChannels = []

function scheduleDailyChannels(channelIds) {
    clientChannels = require("../discord/client")
        .client.channels.cache.filter(x => x instanceof Discord.TextChannel)
    clientChannels = [...clientChannels].map(x => x[1])
    dailyChannels.push(...clientChannels.filter(x => channelIds.includes(`${x.id}`)))
    scheduler.scheduleJob({
        hour: global.dsf.dailyFactHour,
        minute: global.dsf.dailyFactMinute,
        second: global.dsf.dailyFactSecond
    }, async () => {
        const aprilFools = isAprilFools()
        let fact = ((!aprilFools && await storage.getItem('dailyFact')) || '').trim()
        let qualifier = ''
        if (fact) {
            storage.removeItem('dailyFact')
            qualifier = 'Overridden'
        } else if (aprilFools) {
            fact = generateLie()
            qualifier = 'April Fools!'
        } else if (probabilityCheck(global.dsf.staticFactFrequency)) {
            fact = await staticFacts.getAndMark()
            qualifer = 'Static Fact'
        } else {
            fact = generateFact()
        }
        logger.info(`Sending daily fact${(qualifier.length > 0)? ` (${qualifier})` : '...'}`, fact)
        dailyChannels.forEach((channel) => {
            try {
                channel.send(`It's time for the fact of the day!\nAre you ready? Here it is:\n${fact}`)
            } catch (error) {
                logger.error(`Could not send daily fact to '${channel.name}' (${channel.id})`, error)
            }
        })
        if (aprilFools) {
            setTimeout(() => {
                dailyChannels.forEach((channel) => {
                    try {
                        channel.send('April fools!')
                    } catch {
                        logger.warn('Could not send april fools follow up.')
                    }
                })
            }, 5 * 60 * 1000)
        }
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
