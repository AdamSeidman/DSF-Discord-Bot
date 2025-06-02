const logger = require("@adamseidman/logger")

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
                    ephemeral: true
                })
            }
            logger.info('Restarting...', params)
            setTimeout(() => {
                process.kill(process.pid, 'SIGINT')
            }, 1000)
        } else {
            msg.reply('Only the admin can restart the bot.')
        }
    },
    isTesterCommand: true,
    altMsg: 'Restart the bot.'
}
