const { getCurrentHolidays } = require("../../apis/dateNager")

module.exports = {
    response: async (msg) => {
        let holidays = await getCurrentHolidays() // TODO cleanup
        const message = holidays.map(({ holiday, country }) => `It is ${holiday} in ${country}!`)
        await msg.reply(message.join('\n'))
    },
    helpMsg: 'Get Today\'s Holidays'
}
