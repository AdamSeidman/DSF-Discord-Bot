const { generateLie } = require('../../fact/construction')

module.exports = {
    response: (msg, isPlease=false) => {
        const lie = generateLie()
        if (!isPlease || msg.author) {
            msg.channel.send(lie)
        } else {
            msg.reply(lie)
        }
    },
    data: {
        helpMsg: 'Sends a lie.',
        track: 'lie'
    }
}
