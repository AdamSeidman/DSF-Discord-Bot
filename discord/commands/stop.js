const { stop } = require('../modules/voice')

module.exports = {
    response: (msg, params) => {
        const success = stop(msg)
        const message = success? 'Stopping music...' : 'Could not find music to stop.'
        if (!params.injected) {
            msg.reply({ content: message, ephemeral: true })
        } else if (!success) {
            msg.channel.send(message)
        }
    },
    helpMsg: 'Stops music and removes bot from voice channel.'
}
