const { postpone } = require("logic-kit")
const logger = require("@adamseidman/logger")
const { MessageFlags } = require("discord.js")

module.exports = {
    response: async (msg, params) => {
        if ((msg.author || msg.member).id == process.env.DISCORD_ADMIN_USER_ID) {
            if (params.injected) {
                params = params.params.join(' ')
                if (params.length < 1) {
                    params = '(No reason specified.)'
                }
            } else {
                params = '(No reason specified.)'
                await msg.reply({
                    content: 'Restarting...',
                    flags: MessageFlags.Ephemeral
                })
            }
            await require("../client").close()
            logger.info('Restarting...', params)
            console.log('\n')
            postpone(() => process.kill(process.pid, 'SIGINT'))
        } else {
            msg.reply('Only the admin can restart the bot.')
        }
    },
    isTesterCommand: true,
    altMsg: 'Restart the bot.'
}
