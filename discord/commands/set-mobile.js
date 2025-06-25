const restart = require("./restart")
const storage = require("node-persist")
const { postpone } = require("logic-kit")
const logger = require("@adamseidman/logger")
const { MessageFlags } = require("discord.js")

async function setMobile(msg) {
    const usesMobile = msg.options.getBoolean('mobile')
    const restarting = msg.options.getBoolean('do-restart') || false
    const wasMobile = await storage.getItem('isMobile') || false
    if (wasMobile === usesMobile) {
        return null
    }
    logger.info(`Setting isMobile to ${usesMobile}.`)
    await storage.setItem('isMobile', usesMobile)
    return { restarting, usesMobile }
}

module.exports = {
    response: async (msg, params) => {
        if (params.injected) {
            return
        }
        if (params.user.id == global.owner?.id) {
            const { restarting, usesMobile } = await setMobile(msg)
            let content = 'Setting...'
            if (typeof restarting !== 'boolean') {
                content = 'Redundant request.'
            } else if (restarting) {
                content = 'Restarting...'
            }
            await msg.reply({
                content,
                flags: MessageFlags.Ephemeral
            })
            if (restarting) {
                postpone(() => {
                    restart.response(msg, {
                        user: global.owner,
                        params: `Auto-Reason- Setting mobile to ${usesMobile}.`.split(' '),
                        injected: true
                    })
                })
            }
        } else {
            msg.reply('You are not the bot owner.')
        }
    },
    argModifier: (builder) => {
        builder.addBooleanOption((option) =>
            option
                .setName('mobile')
                .setDescription('Using Phone')
                .setRequired(true)
        )
        builder.addBooleanOption((option) =>
            option
                .setName('do-restart')
                .setDescription('Do immediate restart if changed.')
                .setRequired(false)
        )
    },
    isTesterCommand: true,
    altMsg: 'Set whether the bot is on mobile. (Bot Owner Only)'
}
