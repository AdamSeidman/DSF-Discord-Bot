const { EmbedBuilder } = require("discord.js")

const units = {
    year: 31536000,
    month: 2592000,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
}

function getString() {
    let remainingSeconds = process.uptime()
    const result = []
    Object.entries(units).forEach(([label, seconds]) => {
        const count = Math.floor(remainingSeconds / seconds)
        if (count > 0) {
            result.push(`${count} ${label}${count > 1 ? 's' : ''}`)
            remainingSeconds %= seconds
        }
    })
    return result.length > 0 ? result.slice(0, 3).join(' ') : '<1 second'
}

module.exports = {
    response: (msg) => {
        const embed = new EmbedBuilder()
            .setColor('#B0763D')
            .setTitle('Bot Uptime')
            .setDescription(getString())
            .setTimestamp()
        return msg.reply({ embeds: [embed] })
    },
    altMsg: 'View the bot\'s uptime.'
}
