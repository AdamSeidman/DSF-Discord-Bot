const { tagDictionary } = require('../../db/tables/facts')

module.exports = {
    response: (msg, params) => {
        const garbage = tagDictionary.gibberish()
        if (params.isPlease || !params.injected) {
            msg.reply(garbage)
        } else {
            msg.channel.send(garbage)
        }
    },
    helpMsg: 'Just try it...',
    isSlashCommand: true
}
