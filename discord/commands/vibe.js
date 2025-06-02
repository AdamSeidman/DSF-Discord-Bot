const { ChannelType } = require("discord.js")
const { vibe } = require("../modules/voice")

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
        const success = vibe(msg)
        const message = success? 'Vibing...' : 'Failed to start vibing.'
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
                .setDescription('Channel to vibe in.')
                .addChannelTypes(ChannelType.GuildVoice)
                .setRequired(false)
        )
    },
    helpMsg: 'Just vibe in a voice channel.'
}
