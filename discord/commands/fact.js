const Discord = require("discord.js")
const stats = require("@tables/stats")
const logger = require("@adamseidman/logger")
const { generateFact } = require("@facts/construction")

const MAX_FACTS = global.dsf.maxFactCount
const TYPING_TIMEOUT = 350

async function sendMultipleMessages(channel, arr) {
    if (!Array.isArray(arr)) return

    for (const [idx, item] of arr.entries()) {
        let timeoutTriggered = false
        const timer = setTimeout(() => {
            timeoutTriggered = true
            if (idx < (arr.length - 1)) {
                channel.sendTyping()
                    .catch(logger.warn)
            }
        }, TYPING_TIMEOUT)
        await channel.send(item)
        if (!timeoutTriggered) {
            clearTimeout(timer)
        }
    }
}

function handleMultiCommand(msg, params, factFn) {
    let numFacts = 1
    if (params.injected && params.params.length > 0) {
        try {
            numFacts = parseInt(params.params[0].trim())
        } catch {
            numFacts = 1
        }
    } else if (!params.injected) {
        numFacts = msg.options?.getInteger('num') || 1
    }
    numFacts = Math.min(Math.max(numFacts, 0), MAX_FACTS)
    if (numFacts < 1) {
        msg.reply('...')
            .catch(logger.warn)
        return 0
    }
    const facts = Array.from({length: numFacts}, () => factFn())
    if (!params.injected) {
        if (facts.join('\n').length < 2000) {
            msg.reply(facts.join('\n'))
                .catch(logger.error)
        } else {
            msg.reply(`${facts.shift()}  ${Discord.italic(`(+${numFacts - 1})`)}`)
                .then(() => sendMultipleMessages(msg.channel, facts))
                .catch(logger.error)
        }
    } else if (params.isPlease) {
        msg.reply(facts[0])
    } else {
        sendMultipleMessages(msg.channel, facts)
            .catch(logger.error)
    }
    return numFacts
}

module.exports = {
    response: (msg, params) => {
        const num = handleMultiCommand(msg, params, generateFact)
        stats.updateStat(params.user, 'fact', num)
    },
    argModifier: (builder, desc='facts') =>  {
        builder.addIntegerOption((option) =>
            option
                .setName('num')
                .setDescription(`Number of ${desc}.`)
                .setMinValue(1)
                .setMaxValue(MAX_FACTS)
                .setRequired(false)
        )
    },
    helpMsg: 'Sends a stupid fact.',
    handleMultiCommand
}
