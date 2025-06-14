const logger = require("@adamseidman/logger")
const { setChannel } = require("@tables/dailies")

const yesAnswers = ['1', 'true', 'on']
const noAnswers = ['0', 'false', 'off']

module.exports = {
    response: (msg, params) => {
        const scheduler = require("@facts/scheduler")
        if (params.isDM) {
            msg.reply('Cannot set up daily facts in DMs.')
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
            logger.warn('Could not parse arg in /daily')
            return
        }

        let result = setChannel(msg, arg)
        if (!result) {
            msg.reply('An error occurred. Please try again later.')
            logger.error('Could not complete /daily', arg)
            return
        }
        if (arg) {
            result = scheduler.addDailyChannel(msg.channel)
        } else {
            result = scheduler.removeDailyChannel(msg.channel)
        }
        let message = `Channel ${arg? 'already' : 'not'} set up${arg? '' : ' daily stupid facts'}.`
        if (result) {
            message = `Channel ${arg? 'set up for' : 'removed from'} daily stupid facts${arg? '!' : ' list.'
                }${arg? '' : '\n(You should consider turning it back on though...)'}`
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
                .setDescription('Set whether or not daily facts are sent in this channel.')
                .setRequired(true)
        )
    },
    helpMsg: 'Sets up/stop daily stupid facts in the channel.'
}
