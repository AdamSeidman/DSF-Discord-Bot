const { generateFact } = require('../../fact/construction')

module.exports = { // TODO
    response: (msg, params) => {
        const fact = generateFact()
        // TODO params, etc
        if (params.injected) {
            msg.channel.send(fact)
        } else {
            msg.reply(fact)
        }
    },
    helpMsg: 'Sends a stupid fact.',
    isSlashCommand: true
}
