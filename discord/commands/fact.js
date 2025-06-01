const Discord = require("discord.js")
const stats = require("../../db/tables/stats")
const { generateFact } = require("../../fact/construction")

const MAX_FACTS = process.dsf.maxFactCount

function handleMultiCommand(msg, params, factFn) {
    let numFacts = 1
    if (params.injected && params.params.length > 0) {
        try {
            numFacts = parseInt(params.params[0].trim())
        } catch {
            numFacts = 1
        }
    } else if (!params.injected) {
        numFacts = msg.options.getInteger('num')
        if (numFacts === null) {
            numFacts = 1
        }
    }
    numFacts = Math.min(Math.max(numFacts, 0), MAX_FACTS)
    if (numFacts < 1) {
        msg.reply('...')
        return 0
    }
    const facts = Array.from({length: numFacts}, () => factFn())
    if (!params.injected) {
        if (facts.join('\n').length < 2000) {
            msg.reply(facts.join('\n'))
        } else {
            facts.forEach((item, idx) => {
                if (idx === 0) {
                    msg.reply(`${item}  ${Discord.italic(`(+${numFacts - 1})`)}`)
                } else {
                    msg.channel.send(item)
                }
            })
        }
    } else {
        facts.forEach(x => msg.channel.send(x))
    }
    return numFacts
}

module.exports = {
    response: (msg, params) => {
        const num = handleMultiCommand(msg, params, generateFact)
        stats.updateStat(msg, 'fact', num)
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
