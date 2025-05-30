const { pause } = require('../modules/voice')

module.exports = {
    response: (msg, params) => {
        const success = pause(msg)
        const message = success? 'Pausing music...' : 'Could not find music to pause.'
        if (!params.injected) {
            msg.reply({ content: message, ephemeral: true })
        } else if (!success) {
            msg.channel.send(message)
        }
    },
    helpMsg: 'Pauses music, if playing.'
}
