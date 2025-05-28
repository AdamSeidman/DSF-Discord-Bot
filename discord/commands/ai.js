const { getAiFact } = require('../../fact/ai')
const logger = require('../../utils/logger')

module.exports = {
    response: async (msg, params) => {
        if (params.injected) {
            getAiFact()
                .then((fact) => msg.channel.send(`Here's your AI fact:\n${fact}`))
                .catch((error) => {
                    msg.reply('Error generating AI fact.')
                    logger.error('Error generating AI fact.', error)
                })
        } else {
            msg.deferReply()
                .then(getAiFact)
                .then((fact) => msg.followUp(fact))
                .catch((error) => {
                    msg.followUp('Error generating AI fact.')
                    logger.error('Error generating AI fact.', error)
                })
        }
    },
    helpMsg: 'Get a stupid fact from OpenAI',
    isSlashCommand: true,
    track: 'fact'
}
