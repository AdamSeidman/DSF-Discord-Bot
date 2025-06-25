const Discord = require("discord.js")
const items = require("@tables/items")
const logger = require("@adamseidman/logger")
const Imgflip = require("../../apis/imgflip")
const { probabilityCheck } = require("logic-kit")
const { generateFact, getLastSubject } = require("@facts/construction")

if (Imgflip.isEnabled()) {
    module.exports = {
        response: async (msg, params) => {
            let message = 'Internal Error Occurred'
            try {
                const attachment = await Imgflip.getMeme(generateFact().replaceAll('_', ''),
                    (idx, total) => {
                        if (total === 2) {
                            if (probabilityCheck(global.dsf.bottomTextChance || 0.05)) {
                                return 'Bottom Text'
                            } else if (probabilityCheck(0.5) && typeof getLastSubject() === 'string') {
                                return getLastSubject()
                            } else {
                                return items.getRandom()
                            }
                        } else if (total > 3 && idx % 2 === 1) {
                            return generateFact()
                        } else {
                            return items.getRandom()
                        }
                    })
                message = { files: [{ attachment }] }
            } catch (error) {
                logger.error('Error generating meme.', error)
                message = {
                    content: 'An error occurred while attempting to generate this meme.',
                    flags: Discord.MessageFlags.Ephemeral
                }
            }
            if (params.injected) {
                msg.channel.send(message)
            } else {
                msg.reply(message)
            }
        },
        helpMsg: 'Attempts to generate a stupid fact meme.'
    }
}
