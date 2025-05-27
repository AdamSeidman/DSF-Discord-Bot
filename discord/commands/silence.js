const { startSilence } = require('../modules/voice')

module.exports = {
    response: (msg) => {
        msg.reply({
            content: (startSilence(msg)? 'Starting silence...' : 'Could not start silence.'),
            ephemeral: true
        })
    },
    data: {
        helpMsg: 'Silence, occasionally broken up by effects.'
    }
}
