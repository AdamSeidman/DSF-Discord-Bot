const prius = require("@media/prius")
const stats = require("@tables/stats")

module.exports = {
    response: (msg, params) => {
        const attachment = prius.getRandomImage()
        const name = attachment?.split('/').pop().toLowerCase()
        let message = {
            content: 'Ya like jazz?',
            files: [{ attachment }]
        }
        if (!name.endsWith('.jpg')) {
            message = 'Could not find a Toyota dealership!'
        } else if (!name.includes('prius')) {
            message.content = 'Oops! RAV4?'
        }
        if (params.injected || params.isPlease) {
            msg.channel.send(message)
        } else {
            msg.reply(message)
        }
        stats.updateStat(params.user, 'prius')
    },
    helpMsg: 'No explanation needed.'
}
