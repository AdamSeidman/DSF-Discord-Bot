const { playMusic } = require("../modules/voice")
const { ChannelType, MessageFlags } = require("discord.js")

module.exports = {
    response: (msg, params) => {
        if (!params.injected) {
            let channel = msg.options.getChannel('channel')
            if (channel) {
                msg.member = {
                    voice: { channel }
                }
                msg.channel = channel
            }
        }
        const success = playMusic(msg)
        const message = success? 'Playing...' : 'Failed to start playing music.'
        if (!params.injected) {
            msg.reply({ content: message, flags: MessageFlags.Ephemeral })
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
    helpMsg: 'Plays endless music.'
}
