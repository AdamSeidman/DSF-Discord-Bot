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
const stats = require('../db/handlers/stats')

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
    if (command !== undefined) {
        if (command.track) stats.bumpCount(command.track, msg.author.id)

        if (typeof command.response === 'boolean') {
            let times = 1
            if (!isNaN(message[1])) {
                times = Math.min(20, Number(message[1]))
            }
            if (times > 1 && command.track) {
                stats.bumpCount(command.track, msg.author.id, Math.ceil(times - 1))
            }
            for (let i = 0; i < times; i++) {
                msg.channel.send(facts.getRandomFact(command.response))
            }
        } else {
            command.response(msg, message)
        }
    }
}

// Checks messages for sound effects and plays them if applicable
var handleSoundEffect = async function (msg, isDM) {
    if (isDM) return // Not possible to reach VC from dm
    if (getEffectsServersDB().includes(`${msg.channel.guild.id}`)) {
        let message = utils.stripPunctuation(msg.content.toLowerCase()).trim().split(' ').join('')
        let effect = effects.find(x => message.includes(x))
        if (effect !== undefined) {
            if (await playMusic(msg, effect, true)) {
                stats.bumpCount('Effect', msg.author.id)
            }
        }
    }
}

// Check through lists of knownPhrases for commands, and generic adjectives for fact blurb
var handlePhrases = function (msg) {
    let message = utils.stripPunctuation(msg.content.toLowerCase()).trim().split(' ').join('')
    let phrase = knownPhrases.find(x => message.includes(x.phrase))
    if (phrase !== undefined) {
        if (phrase.track) stats.bumpCount(phrase.track, msg.author.id)
        phrase.response(msg) // From knownPhrases array
    } else {
        // Look for an adjective if no known message is found
        const phrases = utils.stripPunctuation(msg.content.toLowerCase().trim()).split(' ')
        let term = getAdjectives().find(adj => phrases.includes(adj))
        if (term === undefined) return

        msg.channel.send(`Did someone say ${term}?\nThis calls for a fact!\nReady? Here it is:\n${facts.getRandomFact()}`)
    }
}

var handleDMs = function (msg, isDM) {
    if (isDM) {
        console.log(`\n${msg.author.username}: ${msg.content}`)
    }
}

var sendImmediateMessage = async function (channelId, message) {
    let channel = utils.getChannelById(channelId)
    if (channel === undefined) {
        channel = await utils.getUserById(channelId)
    }
    if (channel === undefined) {
        console.error('Supplied channel ID was invalid.')
        return
    }
    console.log(`\tMessage: (${channelId}) ${message}`)
    channel.send(message)
}

module.exports = {
    messageHandlers: [
        handleDMs,
        handleCommand,
        handlePhrases,
        handleSoundEffect
    ],
    sendImmediateMessage
}

// Generic fact sending function (loud is tts) (lie negates the fact template)
var sendFact = function (msg, loud, lie) {
    if (loud) {
        msg.channel.send({content: facts.getRandomFact(lie), tts: true})
    } else {
        msg.reply(facts.getRandomFact(lie))
    }
}

// Generic requests with specific responses
const knownPhrases = [
    {phrase: 'loudfactplease', response: msg => sendFact(msg, true), track: 'Fact'},
    {phrase: 'factplease', response: msg => sendFact(msg), track: 'Fact'},
    {phrase: 'loudlieplease', response: msg => sendFact(msg, true, true), track: 'Lie'},
    {phrase: 'lieplease', response: msg => sendFact(msg, false, true), track: 'Lie'},
    {phrase: 'priusplease', response: postPriusPic, track: 'Prius'},
    {phrase: 'loudacronymplease', response: msg => sendDsfAcronym(msg, true, false), track: 'Acronym'},
    {phrase: 'acronymplease', response: msg => sendDsfAcronym(msg, false, true), track: 'Acronym'},
    {phrase: 'updog', response: msg => msg.channel.send('good to know, thank you')}
]
