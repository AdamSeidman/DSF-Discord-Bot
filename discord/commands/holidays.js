const logger = require("@adamseidman/logger")
const { EmbedBuilder, bold, italic } = require("discord.js")
const { getCurrentHolidays, getDateString } = require("../../apis/dateNager")

function createHolidayMessage(countryMap) {
    if (Object.keys(countryMap).length >= 20) {
        let msg = Object.entries(countryMap).reduce((out, entry) => `${
            out}${entry[0]}\n> ${[...new Set(entry[1])].join('\n> ')}\n`, `${
            bold('Today\'s Holidays')}\n${italic(getDateString())}\n`)
        if (msg.length >= 2000) {
            const append = `...\n${italic('And more!')}`
            return msg.slice(0, 2000 - (append.length + 1)) + append
        }
        return msg
    }
    const embed = new EmbedBuilder()
        .setTitle('Today\'s Holidays')
        .setDescription(getDateString())
        .addFields(...Object.entries(countryMap)
            .map(([country, holidays]) => ({
                name: country,
                value: [...new Set(holidays)].join('\n')
            }))
        )
    return { embeds: [embed] }
}

module.exports = {
    response: async (msg) => {
        let holidays = []
        try {
            holidays = await getCurrentHolidays()
            if (!Array.isArray(holidays)) {
                throw 'Not an array.'
            }
        } catch (error) {
            logger.error('Error retrieving holidays', error)
            return msg.reply('Could not find my calendar...')
        }
        if (holidays.length < 1) {
            return msg.reply('There aren\'t any holidays today :(')
        }
        const countryMap = {}
        holidays.forEach(({ holiday, country }) => (countryMap[country] ??= []).push(holiday))
        return msg.reply(createHolidayMessage(countryMap))
    },
    helpMsg: 'Get Today\'s Holidays'
}
