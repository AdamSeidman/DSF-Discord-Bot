const { startLoud } = require('../modules/voice')

module.exports = {
    response: (msg, params) => { // TODO (not in channel messages) for all!
        const success = startLoud(msg)
        const message = success? 'Starting to be loud...' : 'Could not start screaming.'
        if (!params.injected) {
            msg.reply({ content: message, ephemeral: true })
        } else if (!success) {
            msg.channel.send(message)
        }
    },
    helpMsg: 'Kind of like silence, but the exact opposite.',
    isSlashCommand: true
}
