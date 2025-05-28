const { pause } = require('../modules/voice')

module.exports = {
    response: (msg, params) => {
        msg.reply(pause(msg)? 'Pausing music...' : 'Could not find music to pause.')
    },
    helpMsg: 'Pauses music, if playing.',
    isSlashCommand: true
}
