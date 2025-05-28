const Discord = require('discord.js')

let helpEmbed = null

module.exports = { // TODO
    response: (msg) => {
        if (helpEmbed === null) {
            msg.reply('Internal error while retrieving help message!')
        } else {
            // TODO replying and whatnot
            msg.reply({ embeds: [helpEmbed] })
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
    altMsg: 'Display help menu with available commands.',
    isSlashCommand: true
}
