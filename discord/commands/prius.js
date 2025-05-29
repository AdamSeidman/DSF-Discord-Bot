const prius = require('../../db/media/prius')

module.exports = { // TODO (& tracking)
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
    },
    helpMsg: 'No explanation needed.',
    isSlashCommand: true
}
