const { MessageFlags } = require("discord.js")
const { resume } = require("../modules/voice")

module.exports = {
    response: (msg, params) => {
        const success = resume(msg)
        const message = success? 'Resuming music...' : 'Could not find music to resume.'
        if (!params.injected) {
            return msg.reply({ content: message, flags: MessageFlags.Ephemeral })
        } else if (!success) {
            return msg.channel.send(message)
        }
    },
    helpMsg: 'Resumes music, if playing.'
}
