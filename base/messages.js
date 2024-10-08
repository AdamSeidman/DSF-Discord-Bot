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
const { commands, sendDsfAcronym } = require('./commands')
const { getAdjectives, getAdditions, getItems, find } = require('../db/handlers/random-items')
const utils = require('poop-sock')
const { playMusic, effects } = require('./voice')
const { postPriusPic } = require('./prius')
const { getEffectsServersDB } = require('../db/handlers/server-info')
const stats = require('../db/handlers/stats')
const config = require('../client/config')
const log = require('better-node-file-logger')

// Handles 'dsf!' commands
var handleCommand = function (msg, isDM, isSlashCommand) {
    let message = msg.content.toLowerCase().trim()
    if (message.length < config.constants.commandPrefix.length) {
        return // Messages won't be this small- avoids slicing problems
    }

    if (message.slice(0, config.constants.commandPrefix.length) !== config.constants.commandPrefix.toLowerCase()) return // No prefix found

    if (isDM) {
        msg.reply('Sorry, commands only work in standard text channels.')
        return
    }

    // Look for the command in dictionary. If found, run proper command response
    message = message.slice(config.constants.commandPrefix.length).trim().split(' ')
    // Message content fixes capitalization issues in nuances where content is important
    let command = commands.find(x => x.phrase === message[0])
    if (command !== undefined) {
        if (typeof command.response === 'boolean') {
            let times = 1
            if (!isNaN(message[1])) {
                times = Math.min(config.constants.maxFactCount, Number(message[1]))
            }
            if (command.track && times > 0) {
                stats.bumpCount(command.track, msg.member.id, Math.ceil(times))
            }
            for (let i = 0; i < times; i++) {
                let fact = facts.getRandomFact(command.response)
                if (isSlashCommand) {
                    msg.reply(fact)
                } else {
                    msg.channel.send(fact)
                }
            }
        } else {
            if (command.track) stats.bumpCount(command.track, msg.member.id)
            command.response(msg, message,
                message.length > 1? [message[0], ...msg.content.trim().slice(config.constants.commandPrefix.length).trim().split(' ').slice(1)] : undefined)
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

var hasLoadedAdditions = false

// Check through lists of knownPhrases for commands, and generic adjectives for fact blurb
var handlePhrases = function (msg) {
    if (!hasLoadedAdditions) {
        hasLoadedAdditions = true
        getAdditions().forEach(x => knownPhrases.push(x))
    }
    let message = utils.stripPunctuation(msg.content.toLowerCase()).trim().split(' ').join('')
    let phrase = knownPhrases.find(x => message.includes(x.phrase))
    if (phrase !== undefined) {
        if (phrase.track) stats.bumpCount(phrase.track, msg.author.id)
        if (typeof phrase.response === 'function') {
            phrase.response(msg) // From knownPhrases array
        } else if (phrase.isReply == 1) {
            msg.reply(phrase.response)
        } else {
            msg.channel.send(phrase.response)
        }
    } else {
        // Look for an adjective if no known message is found
        const phrases = utils.stripPunctuation(msg.content.toLowerCase().trim()).split(' ')
        let term = getAdjectives().find(adj => phrases.includes(adj))
        if (term === undefined) {
            let phrase = phrases.join(' ')
            term = getAdjectives().filter(adj => adj.includes(' ')).find(adj => phrase.includes(adj))
            if (term === undefined) return
            else term = `'${term}'`
        }

        msg.channel.send(`Did someone say ${term}?\nThis calls for a fact!\nReady? Here it is:\n${facts.getRandomFact()}`)
    }
}

var handleDMs = function (msg, isDM) {
    if (isDM) {
        log.info('Received direct message.', `${msg.author.username}: ${msg.content}`)
    }
}

var sendImmediateMessage = async function (channelId, message) {
    let channel = utils.getChannelById(channelId)
    if (channel === undefined) {
        channel = await utils.getUserById(channelId)
    }
    if (channel === undefined) {
        log.warn('Supplied channel ID was invalid.')
        return
    }
    log.info('Sending immediate message.', `(${channelId}) ${message}`)
    channel.send(message)
}

module.exports = {
    messageHandlers: [
        handleDMs,
        handleCommand,
        handlePhrases,
        handleSoundEffect
    ],
    sendImmediateMessage,
    handleCommand
}

// Generic fact sending function (loud is tts) (lie negates the fact template)
var sendFact = function (msg, loud, lie) {
    if (loud) {
        msg.channel.send({content: facts.getRandomFact(lie), tts: true})
    } else {
        msg.reply(facts.getRandomFact(lie))
    }
}

// Generic gibberish function (loud is tts)
var sendGibberish = function (msg, loud) {
    if (loud) {
        msg.channel.send({content: facts.getGibberish(), tts: true})
    } else {
        msg.reply(facts.getGibberish())
    }
}

var tellFoundFact = function (msg, isLie) {
    let message = utils.stripPunctuation(msg.content.trim().toLowerCase())
    message = message.slice(message.indexOf('about') + 5).trim()
    let item = find(message, isLie)

    if (item === undefined) {
        item = {...utils.randomArrayItem(getItems()), classifier: 'item'}
        let template = find(item.plural, isLie).template.fact
        facts.stuffItem(item)
        if (message.length > 100) message = message.slice(0, 99)
        let type = isLie? 'lie' : 'fact'
        msg.channel.send(
            `I could not find a ${type} for "${message}" in my database.\nHere's a ${type} about ${item.plural} instead:\n${
                facts.constructFact(template, isLie) }`)
    } else {
        facts.stuffItem(item)
        msg.reply(facts.constructFact(item.template.fact, isLie))
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
    {phrase: 'tellmeafactabout', response: msg => tellFoundFact(msg, false), track: 'Fact'},
    {phrase: 'tellmealieabout', response: msg => tellFoundFact(msg, true), track: 'Lie'},
    {phrase: 'givemeafactabout', response: msg => tellFoundFact(msg, false), track: 'Fact'},
    {phrase: 'givemealieabout', response: msg => tellFoundFact(msg, true), track: 'Lie'},
    {phrase: 'loudgibberishplease', response: msg => sendGibberish(msg, true)},
    {phrase: 'gibberishplease', response: msg => sendGibberish(msg, false)}
]
