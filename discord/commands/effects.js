const effects = require("@media/effects")

module.exports = {
    response: (msg) => {
        return msg.reply(effects.getList().join(', '))
    },
    helpMsg: 'Sends list of available sound effects.'
}
