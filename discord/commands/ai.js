const { getAiFact } = require("@facts/ai")
const logger = require("@adamseidman/logger")
const { isEnabled } = require("../../apis/openai")

const ERROR_MESSAGE = 'Error generating AI fact.'

if (isEnabled()) {
    module.exports = {
        response: (msg, params) => {
            if (params.injected) {
                getAiFact()
                    .then((fact) => msg.channel.send(`Here's your AI fact:\n${fact}`))
                    .catch((error) => {
                        msg.reply(ERROR_MESSAGE)
                        logger.error(ERROR_MESSAGE, error)
                    })
            } else {
                msg.deferReply()
                    .then(getAiFact)
                    .then((fact) => msg.followUp(fact))
                    .catch((error) => {
                        msg.followUp(ERROR_MESSAGE)
                        logger.error(ERROR_MESSAGE, error)
                    })
            }
        },
        helpMsg: 'Get a stupid fact from OpenAI'
    }
}
