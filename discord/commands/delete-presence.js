const fs = require("fs")
const path = require("path")
const logger = require("@adamseidman/logger")
const { PresenceUpdateStatus } = require("discord.js")

async function unsetPresence() {
    logger.info('Un-setting bot presence.')
    await process.bot.setPresence({
        activities: [],
        status: PresenceUpdateStatus.Online
    })
    const filePath = path.join(__dirname, '../presence.json')
    if (fs.existsSync(filePath)) {
        logger.info('Deleting presence.json')
        fs.unlinkSync(filePath)
    }
}

module.exports = {
    response: async (msg, params) => {
        if (params.injected) {
            return
        }
        if (params.user.id == process.owner?.id) {
            msg.reply('Unsetting presence...')
            try {
                await unsetPresence()
            } catch (error) {
                logger.error('Error removing bot presence!', error)
            }
        } else {
            msg.reply('You are not the bot owner.')
        }
    },
    isTesterCommand: true,
    altMsg: 'Remove current bot presence. (Bot Owner Only)'
}
