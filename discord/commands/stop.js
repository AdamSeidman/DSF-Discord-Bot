const { stop } = require("../modules/voice")
const { MessageFlags } = require("discord.js")

module.exports = {
    response: (msg, params) => {
        const success = stop(msg)
        const message = success? 'Stopping music...' : 'Could not find music to stop.'
        if (!params.injected) {
            return msg.reply({ content: message, flags: MessageFlags.Ephemeral })
        } else if (!success) {
            return msg.channel.send(message)
        }
    },
    helpMsg: 'Stops music and removes bot from voice channel.'
}
