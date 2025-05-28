const { startLoud } = require('../modules/voice')

module.exports = {
    response: (msg, params) => {
        msg.reply({
            content: (startLoud(msg)? 'Starting to be loud...' : 'Could not start screaming.'),
            ephemeral: true
        })
    },
    helpMsg: 'Kind of like silence, but the exact opposite.',
    isSlashCommand: true
}
