const { pause } = require('../modules/voice')

module.exports = {
    response: (msg) => {
        msg.reply(pause(msg)? 'Pausing music...' : 'Could not find music to pause.')
    },
    data: {
        helpMsg: 'Pauses music, if playing.'
    }
}
