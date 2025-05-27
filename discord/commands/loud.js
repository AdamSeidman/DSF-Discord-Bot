const { startLoud } = require('../modules/voice')

module.exports = {
    response: (msg) => {
        msg.reply({
            content: (startLoud(msg)? 'Starting to be loud...' : 'Could not start screaming.'),
            ephemeral: true
        })
    },
    data: {
        helpMsg: 'Kind of like silence, but the exact opposite.'
    }
}
