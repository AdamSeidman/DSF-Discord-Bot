const facts = require('./facts')
const { commands, prefix, sendDsfAcronym } = require('./commands')
const { getAdjectives } = require('../db/handlers/random-items')
const utils = require('./utils')
const { playMusic, effects } = require('./voice')
const { postPriusPic } = require('./prius')

var handleThanks = function (msg) {
    if (['thanks', 'thank you', 'thank'].includes(
        utils.stripPunctuation(msg.content.toLowerCase().trim()))
    ) {
        msg.reply('No Problem.')
    }
}

var handleCommand = function (msg, isDM) {
    let message = msg.content.toLowerCase().trim()
    if (message.length <= 3) {
        return
    }

    if (message.slice(0, prefix.length) !== prefix.toLowerCase()) return

    if (isDM) {
        msg.reply('Sorry, commands only work in standard text channels.')
        return
    }

    message = message.slice(prefix.length).trim().split(' ')
    let command = commands.find(x => x.phrase === message[0])
    if (command !== undefined) command.response(msg, message)
}

var handleSoundEffect = function (msg, isDM) {
    if (isDM) {
        return // TODO, check real vc and play there, if possible
        // This goes lower down as well...
    }
    let message = utils.stripPunctuation(msg.content.toLowerCase()).trim().split(' ').join('')
    let effect = effects.find(x => message.includes(x))
    if (effect !== undefined) playMusic(msg, effect, true)
}

var handlePhrases = function (msg) {
    let message = utils.stripPunctuation(msg.content.toLowerCase()).trim().split(' ').join('')
    let phrase = knownPhrases.find(x => message.includes(x.phrase))
    if (phrase !== undefined) {
        phrase.response(msg)
    } else {
        // Look for an adjective if no known message is found
        const phrases = utils.stripPunctuation(msg.content.toLowerCase().trim()).split(' ')
        let term = getAdjectives().find(adj => phrases.includes(adj))
        if (term === undefined) return

        msg.channel.send(`Did someone say ${term}?`)
        msg.channel.send('This calls for a fact!')
        msg.channel.send('Ready? Here it is:')
        msg.channel.send(facts.getRandomFact())
    }
}

module.exports = {
    messageHandlers: [
        handleCommand,
        handlePhrases,
        handleThanks,
        handleSoundEffect
    ]
}

var sendFact = function (msg, loud, lie) {
    if (loud) {
        msg.channel.send(facts.getRandomFact(lie), {tts: true})
    } else {
        msg.reply(facts.getRandomFact(lie))
    }
}

const knownPhrases = [
    {phrase: 'loudfactplease', response: msg => sendFact(msg, true)},
    {phrase: 'factplease', response: msg => sendFact(msg)},
    {phrase: 'loudlieplease', response: msg => sendFact(msg, true, true)},
    {phrase: 'lieplease', response: msg => sendFact(msg, false, true)},
    {phrase: 'priusplease', response: postPriusPic},
    {phrase: 'loudacronymplease', response: msg => sendDsfAcronym(msg, true, false)},
    {phrase: 'acronymplease', response: msg => sendDsfAcronym(msg, false, true)}
]
