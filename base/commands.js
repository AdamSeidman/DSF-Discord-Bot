/**
 * Author: Adam Seidman
 * 
 * All functions and a list of command dict's are defined here.
 * 
 * Exports:
 *     commands: Array of commands
 *         -Each command will have guaranteed 'phrase' and 'response' with msg param
 *         -(optional) Message for help embed: 'helpMsg'
 *     prefix: item to put before commands to register them
 *         - dsf!
 *     sendDsfAcronym: Function to send DSF phrase.
 *         -params:
 *             +msg: originating discord message
 *             +loud: boolean, determines if TTS is True
 *             +isPhrase: boolean, True is reply, False is channel msg
 */

const scheduler = require('./scheduler')
const Discord = require('discord.js')
const voice = require('./voice')
const dsfTerms = require('../db/handlers/dsf-terms')
const { postPriusPic } = require('./prius')
const { randomArrayItem } = require('./utils')
const serverHandler = require('../db/handlers/server-info')

var helpEmbed = undefined
const prefix = 'dsf!'

// Command tells the schedules to add or remove a discord channel from list of dsf's
var setupDailyChannel = function (msg) {
    scheduler.addDailyChannel(msg.channel)
}

var deleteDailyChannel = function (msg) {
    scheduler.removeDailyChannel(msg.channel)
}

// Deletes 1 - 10 previous discord messages
// (Adds 1 to remove 'dsf!delete' command/message)
var deleteFunction = function (msg, args) {
    if (args.length < 2) {
        // args[0] is message; the rest are arguments (space delimited)
        msg.channel.send('Delete command requires an argument.')
    } else {
        const parsed = Number.parseInt(args[1])
        if (Number.isNaN(parsed) || parsed < 1 || parsed > 10) {
            msg.channel.send('Argument should be number from 1-10.')
            return
        }
        msg.channel.bulkDelete(parsed + 1) // Bulk delete
    }
}

const acceptedResponses = { // For sound effects arguments
    true: ['true', '1'],
    false: ['false', '0']
}

// Set sound effects enabled or disabled
var setSoundEffectsEnabled = function (msg, args) {
    if (args.length < 2) {
        // args[0] is message; the rest are arguments (space delimited)
        msg.channel.send('Command requires an argument.')
    } else {
        let argument = args[1].toLowerCase().trim()

        if (![...acceptedResponses.true, ...acceptedResponses.false].includes(argument)) {
            msg.channel.send('Argument should be True or False.')
            return
        }
        // Tell server handler to make database call
        serverHandler.modifyEffectsServerDB(msg.channel, acceptedResponses.true.includes(argument))
    }
}

// Send help embed to channel when requested
var sendHelpMessage = function (msg) {
    let helpMessages = commandArray
        .filter(x => x.helpMsg)
        .sort((a, b) => {a.phrase - b.phrase})
        .map(cmd => {
            return {name: cmd.phrase.slice(0, 1).toUpperCase() + cmd.phrase.slice(1) + ':', value: cmd.helpMsg}
        }) // All command array helpMsg's
    if (helpEmbed === undefined) {
        // Only create help embed once. It is saved as an object
        helpEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('DSF Commands List')
            .setDescription(`Enter '${prefix}' followed by desired command.`)
            .addFields(...helpMessages)
    }
    msg.channel.send(helpEmbed)
}

// Send a DSF acronym message.
// Can potentially move this function somewhere else (?)
var sendDsfAcronym = function (msg, loud, isPhrase) {
    const acronym = `${randomArrayItem(dsfTerms.getAdverbs())} ${randomArrayItem(dsfTerms.getAdjectives())} ${randomArrayItem(dsfTerms.getNouns())}.`
    if (isPhrase) {
        msg.reply(acronym, {tts: loud})
    } else {
        msg.channel.send(acronym, {tts: loud})
    }
}

// Send list of available sound effects as reply
var sendEffectsList = function (msg) {
    if (voice.effects.length === 0) {
        msg.reply('There are currently no sound effects in the system.')
    }
    let message = JSON.stringify(voice.effects).substring(2).split('"').join('')
    msg.reply(message.substring(0, message.length - 1).split(',').join(', '))
}

var commandArray = [
    {phrase: 'help', response: sendHelpMessage},
    {phrase: 'daily', response: setupDailyChannel, helpMsg: 'Sets up daily stupid facts in the channel.'},
    {phrase: 'delete', response: deleteFunction, helpMsg: 'Deletes the last (up to 10) messages in the channel.'},
    {phrase: 'dsf', response: msg => sendDsfAcronym(msg, false), helpMsg: 'Gives a DSF acronym.'},
    {phrase: 'dsf-loud', response: msg => sendDsfAcronym(msg, true), helpMsg: 'A DSF acronym, but loud.'},
    {phrase: 'effects', response: sendEffectsList, helpMsg: 'Sends list of available sound effects.'},
    {phrase: 'effects-enabled', response: setSoundEffectsEnabled, helpMsg: 'Enables or disables sound effects on the server.'},
    {phrase: 'end-daily', response: deleteDailyChannel, helpMsg: 'Stops sending daily stupid facts to this channel.'},
    {phrase: 'fact', response: false, helpMsg: 'Sends a stupid fact.'},
    {phrase: 'lie', response: true, helpMsg: 'Sends a lie.'},
    {phrase: 'music', response: msg => voice.playMusic(msg, 'music'), helpMsg: 'Plays endless music.'},
    {phrase: 'pause', response: voice.pauseMusic, helpMsg: 'Pauses music, if playing.'},
    {phrase: 'prius', response: postPriusPic, helpMsg: 'No explanation needed.'},
    {phrase: 'resume', response: voice.resumeMusic, helpMsg: 'Resumes music, if playing.'},
    {phrase: 'stop', response: voice.stopMusic, helpMsg: 'Stops music and removed bot from voice channel.'}
]

module.exports = {
    commands: commandArray,
    prefix: prefix,
    sendDsfAcronym: sendDsfAcronym
}