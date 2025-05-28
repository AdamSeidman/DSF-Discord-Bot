const prius = require('../../db/media/prius')

module.exports = { // TODO (& tracking)
    response: (msg, params) => {
        let message = {
            content: 'Ya like jazz?',
            files: [{ attachment: prius.getRandomImage() }]
        }
        if (!message.files[0].attachment.endsWith('.jpg')) {
            message = 'Could not find Toyota!'
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
