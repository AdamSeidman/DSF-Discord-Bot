const { generateFact } = require('../../fact/construction')

const MAX_FACTS = 20

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
    let facts = Array.from({length: numFacts}, () => factFn()).join('\n')
    if (facts.length >= 2000) {
        facts = facts.slice(0, 1995) + '...'
    }
    if (params.isPlease || !params.injected) {
        msg.reply(facts)
    } else {
        msg.channel.send(facts)
    }
    return numFacts
}

module.exports = {
    response: (msg, params) => {
        const numFacts = handleMultiCommand(msg, params, generateFact)
        // TODO stats
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
