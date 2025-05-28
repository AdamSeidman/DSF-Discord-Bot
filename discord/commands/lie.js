const { generateLie } = require('../../fact/construction')

module.exports = {
    response: (msg, params) => { // TODO tracking on everything
        const lie = generateLie()
        // if (!isPlease || msg.author) {
        //     msg.channel.send(lie)
        // } else {
            msg.reply(lie)
        // }
    },
    helpMsg: 'Sends a lie.',
    isSlashCommand: true
}
