const Discord = require('discord.js')

let helpEmbed = null

module.exports = {
    response: (msg, params) => {
        if (helpEmbed === null) {
            msg.reply({
                content: 'Could not generate message! Please try again soon.',
                ephemeral: true
            })
        } else {
            if (params.injected) {
                msg.channel.send({ embeds: [helpEmbed] })
            } else {
                msg.reply({ embeds: [helpEmbed] })
            }
        }
    },
    buildEmbed: (messages) => {
        const { cmdPrefix } = require('../modules/messages')
        helpEmbed = new Discord.EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('DSF Commands List')
            .setDescription(`Enter '${cmdPrefix}' or '/' followed by desired command.`)
            .addFields(...Object.entries(messages).map(([phrase, msg]) => {
                return {
                    name: phrase.slice(0, 1).toUpperCase() + phrase.slice(1),
                    value: msg,
                    inline: true
                }
            }))
    },
    altMsg: 'Display help menu with available commands.'
}
