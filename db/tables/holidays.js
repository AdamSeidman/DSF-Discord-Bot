const { Table } = require("../database")
const scheduler = require("node-schedule")
const logger = require("@adamseidman/logger")
const { TextChannel, PermissionFlagsBits } = require("discord.js")
const { isNthDayOfMonth } = require("logic-kit")

const table = new Table('extraHolidays')

async function addHoliday(holiday, submitted_by) {
    logger.debug(`New holiday submitted by ${submitted_by} (${holiday?.name})`, holiday)
    const { error } = await table.client
        .from(table.name)
        .insert({ ...holiday, submitted_by })
    if (error) {
        logger.error(`Could not insert new item from ${submitted_by} ${
            JSON.stringify(holiday)}!`, error)
    } else {
        await table.refresh()
    }
    return error
}

function getAll() {
    const year = new Date().getFullYear()
    return table.data.map(({ name, day, month, is_irregular }) => {
        const ret = {
            name,
            countryCode: 'DSF'
        }
        if (is_irregular) {
            ret.date = `${isNthDayOfMonth(Math.floor(day / 10), (day % 10)) && 
                require("../../apis/dateNager").getDateString()}`
        } else {
            ret.date = `${year}-${
                String(month).padStart(2, '0')}-${
                String(day).padStart(2, '0')}`
        }
        return ret
    })
}

function broadcastHolidayMessage(message) {
    const client = require("discord")
    const channels = []
    
    for (const [_, guild] of client?.guilds.cache) {
        const channel = guild?.channels.cache.find((channel) => 
            channel instanceof TextChannel &&
            channel.name === global.dsf.dailyHolidaysChannelName &&
            channel.permissionsFor(guild.members?.me)?.has(PermissionFlagsBits.SendMessages))
        if (channel) channels.push(channel)
    }

    logger.debug(`Sending holiday broadcast to ${channels.length} channels.`)
    return Promise.allSettled(channels.map((channel) =>
        channel.send(message).catch((error) => {
            logger.error(`Could not send holiday broadcast to ${channel?.id} in ${channel?.guild.id}`, error)
            throw error
        })))
}

async function sendDailyMessage() {
    try {
        const { response } = require("discord/commands/holidays")
        let message = null
        await response({ reply: (content) => {
            if (Array.isArray(content?.embeds)) {
                message = content
            }
        }})
        await broadcastHolidayMessage(message || 'I looked in my calendar, but there aren\'t holidays today :(')
    } catch (error) {
        logger.error('Error sending daily holiday message(s).', error)
    }
}

if (global.dsf?.dailyHolidaysTime?.hour) {
    scheduler.scheduleJob(global.dsf.dailyHolidaysTime, sendDailyMessage)
}

module.exports = {
    refresh: () => table.refresh(),
    getAll,
    addHoliday
}
