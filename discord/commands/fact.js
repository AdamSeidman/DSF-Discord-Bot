const { generateFact } = require('../../fact/construction')

module.exports = { // TODO
    response: (msg, isPlease=false) => {
        const fact = generateFact()
        if (!isPlease || msg.author) {
            msg.channel.send(fact)
        } else {
            msg.reply(fact)
        }
    },
    data: {
        helpMsg: 'Sends a stupid fact.',
        track: 'fact'
    }
}
