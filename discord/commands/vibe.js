const { vibe } = require("../modules/voice")
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
        const success = vibe(msg)
        const message = success? 'Vibing...' : 'Failed to start vibing.'
        if (!params.injected) {
            return msg.reply({ content: message, flags: MessageFlags.Ephemeral })
        } else if (!success) {
            return msg.channel.send(message)
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
