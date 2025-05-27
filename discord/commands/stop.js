const { stop } = require('../modules/voice')

module.exports = {
    response: (msg) => {
        msg.reply(stop(msg)? 'Stopping music...' : 'Could not find music to stop.')
    },
    data: {
        helpMsg: 'Stops music and removes bot from voice channel.'
    }
}
