const Discord = require("discord.js")
const items = require("@tables/items")
const logger = require("@adamseidman/logger")
const Imgflip = require("../../apis/imgflip")
const { generateFact } = require("@facts/construction")

if (Imgflip.isEnabled()) {
    module.exports = {
        response: async (msg, params) => {
            let message = 'Internal Error Occurred'
            try {
                const attachment = await Imgflip.getMeme(generateFact().replaceAll('_', ''), items.getRandom)
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
