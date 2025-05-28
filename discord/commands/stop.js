const { stop } = require('../modules/voice')

module.exports = {
    response: (msg, params) => {
        msg.reply(stop(msg)? 'Stopping music...' : 'Could not find music to stop.')
    },
    helpMsg: 'Stops music and removes bot from voice channel.',
    isSlashCommand: true
}
