const { generateFact } = require('../../fact/construction')

module.exports = { // TODO
    response: (msg, params) => {
        const fact = generateFact()
        // TODO params, etc
        if (params.isPlease || !params.injected) {
            msg.reply(fact)
        } else {
            msg.channel.send(fact)
        }
    },
    helpMsg: 'Sends a stupid fact.',
    isSlashCommand: true
}
