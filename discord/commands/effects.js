const effects = require('../../db/media/effects')

module.exports = {
    response: (msg) => {
        msg.reply(effects.getList().join(', '))
    },
    helpMsg: 'Sends list of available sound effects.',
    isSlashCommand: true
}
