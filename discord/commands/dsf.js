const acronyms = require('../../db/tables/acronyms')

module.exports = { // TODO (qty?)
    response: (msg, params) => {
        const acronym = acronyms.getAcronym()
        if (params.isPlease || !params.injected) {
            msg.reply(acronym)
        } else {
            msg.channel.send(acronym)
        }
    },
    helpMsg: 'Gives a DSF acronym.',
    isSlashCommand: true,
}
