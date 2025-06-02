const logger = require('@adamseidman/logger')
const database = require('../../db/tables/effectsGuilds')

const yesAnswers = ['1', 'true', 'on']
const noAnswers = ['0', 'false', 'off']

module.exports = {
    response: async (msg, params) => {
        if (params.isDM) {
            msg.reply('This command is not available in DMs.')
            return
        }
        let arg = null
        if (params.injected) {
            arg = params.params[0]?.trim().toLowerCase()
            if (yesAnswers.includes(arg)) {
                arg = true
            } else if (noAnswers.includes(arg)) {
                arg = false
            } else {
                msg.reply('Did not understand argument!')
                return
            }
        } else {
            arg = msg.options.getBoolean('enabled')
        }
        if (typeof arg !== 'boolean') {
            msg.reply('Received invalid command!')
            logger.warn('Could not parse arg in /effects-enabled')
            return
        }

        let result = await database.setGuild(msg.guild.id, arg, msg.guild.name)
        let message = arg? 'Server set up for sound effects!' : 'Sound effects removed from server.'
        if (result.error) {
            message = 'An error occurred. Please try again later.'
            params.injected = false
            logger.error('Could not complete /effects-enabled', arg)
            return
        } else if (result.failed) {
            message = arg? 'Server is already set up for sound effects.' : 'Effects are not enabled on this server.'
        }
        if (params.injected) {
            msg.channel.send(message)
        } else {
            msg.reply(message)
        }
    },
    argModifier: (builder) => {
        builder.addBooleanOption((option) =>
            option
                .setName('enabled')
                .setDescription('Set whether or not effects can be triggered by chat messages.')
                .setRequired(true)
        )
    },
    helpMsg: 'Enables or disables sound effects on the server.'
}
