const { ChannelType } = require('discord.js')
const { playMusic } = require('../modules/voice')

module.exports = {
    response: (msg, params) => { // TODO channel option with voice only?
        const success = playMusic(msg)
        const message = success? 'Playing...' : 'Failed to start playing music.'
        if (!params.injected) {
            msg.reply({ content: message, ephemeral: true })
        } else if (!success) {
            msg.channel.send(message)
        }
    },
    argModifier: (builder) => {
        builder.addChannelOption((option) =>
            option
                .setName('channel')
                .setDescription('Channel to play music in.')
                .addChannelTypes(ChannelType.GuildVoice)
                .setRequired(false)
        )
    },
    helpMsg: 'Plays endless music.',
    isSlashCommand: true
}
