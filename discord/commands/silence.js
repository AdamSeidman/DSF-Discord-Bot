const { MessageFlags } = require("discord.js")
const { startSilence } = require("../modules/voice")

module.exports = {
    response: (msg, params) => {
        const success = startSilence(msg)
        const message = success? 'Starting silence...' : 'Could not start silence.'
        if (!params.injected) {
            return msg.reply({ content: message, flags: MessageFlags.Ephemeral })
        } else if (!success) {
            return msg.channel.send(message)
        }
    },
    helpMsg: 'Silence, occasionally broken up by effects.'
}
