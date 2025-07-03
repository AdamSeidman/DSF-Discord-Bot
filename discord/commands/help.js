const { EmbedBuilder, MessageFlags } = require("discord.js")

let helpEmbed = null

module.exports = {
    response: (msg, params) => {
        if (helpEmbed === null) {
            return msg.reply({
                content: 'Could not generate message! Please try again soon.',
                flags: MessageFlags.Ephemeral
            })
        } else {
            if (params.injected) {
                return msg.channel.send({ embeds: [helpEmbed] })
            } else {
                return msg.reply({ embeds: [helpEmbed] })
            }
        }
    },
    buildEmbed: (messages) => {
        const { cmdPrefix } = require("../modules/messages")
        helpEmbed = new EmbedBuilder()
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
