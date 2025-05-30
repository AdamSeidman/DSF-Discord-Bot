const { startSilence } = require('../modules/voice')

module.exports = {
    response: (msg, params) => {
        const success = startSilence(msg)
        const message = success? 'Starting silence...' : 'Could not start silence.'
        if (!params.injected) {
            msg.reply({ content: message, ephemeral: true })
        } else if (!success) {
            msg.channel.send(message)
        }
    },
    helpMsg: 'Silence, occasionally broken up by effects.'
}
