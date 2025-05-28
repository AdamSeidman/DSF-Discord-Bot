const { tagDictionary } = require('../../db/tables/facts')

module.exports = { // TODO
    response: (msg, params) => {
        msg.reply(tagDictionary.gibberish()) // TODO reply and whatnot
    },
    helpMsg: 'Just try it...',
    isSlashCommand: true
}
