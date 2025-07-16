const logger = require("@adamseidman/logger")
const { EmbedBuilder } = require("discord.js")
const { getCurrentHolidays, getDateString } = require("../../apis/dateNager")

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
        const embed = new EmbedBuilder()
            .setTitle('Today\'s Holidays')
            .setDescription(getDateString())
            .addFields(...Object.entries(countryMap).map(([country, holidays]) => {
                return {
                    name: country,
                    value: holidays.join('\n')
                }
            }))
        return msg.reply({ embeds: [embed] })
    },
    helpMsg: 'Get Today\'s Holidays'
}
