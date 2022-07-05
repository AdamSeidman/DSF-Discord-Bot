/**
 * Author: Adam Seidman
 * 
 * Provides message handlers to be used by bot client.
 * 
 * Exports:
 *     messageHandlers- list of handle functions for messages
 *         params (in handler functions):
 *             msg (discord.js message object)
 *             isDM (not always used- whether or not this is a private message)
 */

const facts = require('./facts')
const { commands, prefix, sendDsfAcronym } = require('./commands')
const { getAdjectives } = require('../db/handlers/random-items')
const utils = require('./utils')
const { playMusic, effects } = require('./voice')
const { postPriusPic } = require('./prius')
const { getEffectsServersDB } = require('../db/handlers/server-info')

// When a user specifically thanks the bot (or anyone really)
var handleThanks = function (msg) {
    if (['thanks', 'thank you', 'thank'].includes(
        utils.stripPunctuation(msg.content.toLowerCase().trim()))
    ) {
        msg.reply('No Problem.')
    }
}

// Handles 'dsf!' commands
var handleCommand = function (msg, isDM) {
    let message = msg.content.toLowerCase().trim()
    if (message.length < prefix.length) {
        return // Messages won't be this small- avoids slicing problems
    }

    if (message.slice(0, prefix.length) !== prefix.toLowerCase()) return // No prefix found

    if (isDM) {
        msg.reply('Sorry, commands only work in standard text channels.')
        return
    }

    // Look for the command in dictionary. If found, run proper command response
    message = message.slice(prefix.length).trim().split(' ')
    let command = commands.find(x => x.phrase === message[0])
    if (command !== undefined) command.response(msg, message)
}

// Checks messages for sound effects and plays them if applicable
var handleSoundEffect = function (msg, isDM) {
    if (isDM) return // Not possible to reach VC from dm
    if (getEffectsServersDB().includes(`${msg.channel.guild.id}`)) {
        let message = utils.stripPunctuation(msg.content.toLowerCase()).trim().split(' ').join('')
        let effect = effects.find(x => message.includes(x))
        if (effect !== undefined) playMusic(msg, effect, true)
    }
}

// Check through lists of knownPhrases for commands, and generic adjectives for fact blurb
var handlePhrases = function (msg) {
    let message = utils.stripPunctuation(msg.content.toLowerCase()).trim().split(' ').join('')
    let phrase = knownPhrases.find(x => message.includes(x.phrase))
    if (phrase !== undefined) {
        phrase.response(msg) // From knownPhrases array
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

// Generic fact sending function (loud is tts) (lie negates the fact template)
var sendFact = function (msg, loud, lie) {
    if (loud) {
        msg.channel.send(facts.getRandomFact(lie), {tts: true})
    } else {
        msg.reply(facts.getRandomFact(lie))
    }
}

// Generic requests with specific responses
const knownPhrases = [
    {phrase: 'loudfactplease', response: msg => sendFact(msg, true)},
    {phrase: 'factplease', response: msg => sendFact(msg)},
    {phrase: 'loudlieplease', response: msg => sendFact(msg, true, true)},
    {phrase: 'lieplease', response: msg => sendFact(msg, false, true)},
    {phrase: 'priusplease', response: postPriusPic},
    {phrase: 'loudacronymplease', response: msg => sendDsfAcronym(msg, true, false)},
    {phrase: 'acronymplease', response: msg => sendDsfAcronym(msg, false, true)}
]
