const { MessageFlags } = require("discord.js")
const { startLoud } = require("../modules/voice")

module.exports = {
    response: (msg, params) => {
        const success = startLoud(msg)
        const message = success? 'Starting to be loud...' : 'Could not start screaming.'
        if (!params.injected) {
            msg.reply({ content: message, flags: MessageFlags.Ephemeral })
        } else if (!success) {
            msg.channel.send(message)
        }
    },
    helpMsg: 'Kind of like silence, but the exact opposite.'
}
