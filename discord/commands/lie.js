const { generateLie } = require('../../fact/construction')

module.exports = {
    response: (msg, params) => { // TODO tracking on everything!
        const lie = generateLie()
        // TODO params, etc
        if (params.isPlease || !params.injected) {
            msg.reply(lie)
        } else {
            msg.channel.send(lie)
        }
    },
    helpMsg: 'Sends a lie.',
    isSlashCommand: true
}
