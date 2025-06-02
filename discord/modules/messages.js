const fs = require("fs")
const path = require("path")
const voice = require("./voice")
const commands = require("./commands")
const fact = require("../commands/fact")
const { ChannelType } = require("discord.js")
const hosts = require("../../db/tables/hosts")
const stats = require("../../db/tables/stats")
const effects = require("../../db/media/effects")
const phrases = require("../../db/tables/phrases")
const construction = require("../../fact/construction")
const adjectives = require("../../db/tables/adjectives")
const effectsGuilds = require("../../db/tables/effectsGuilds")
const { copyObject, stripPunctuation, removeSpaces, cleanUpSpaces,
    probabilityCheck } = require("logic-kit")

const COMMAND_PREFIX = 'd!' // TODO dsf
const availableCommands = []

fs.readdirSync(path.join(__dirname, '../commands')).forEach((file) => {
    if (path.extname(file) === '.js') {
        const phrase = file.slice(0, file.indexOf('.'))
        if (typeof require(`../commands/${phrase}`)?.response === 'function') {
            availableCommands.push(phrase)
        }
    }
})

function handleCommand(msg) {
    let message = msg.content.trim()
    if (!message.toLowerCase().startsWith(COMMAND_PREFIX)) return
    message = cleanUpSpaces(message.slice(COMMAND_PREFIX.length)).split(' ')
    msg.commandName = message.shift().toLowerCase()
    if (!availableCommands.includes(msg.commandName)) return
    msg.userParams = {
        injected: true,
        isPlease: false,
        isDM: msg.channel.type === ChannelType.DM,
        isTestingGuild: msg.guild?.id == process.env.DISCORD_TESTING_GUILD_ID,
        params: copyObject(message)
    }
    if (!msg.member) {
        msg.member = msg.author
    }
    commands.handleSlashCommand(msg)
}

const pleaseMap = {
    fact: 'fact',
    lie: 'lie',
    prius: 'prius',
    acronym: 'dsf',
    gibberish: 'gibberish'
}

function handlePlease(msg) {
    let parts = removeSpaces(stripPunctuation(msg.content)).toLowerCase().split('please')
    parts.pop()
    if (parts.length < 1) return
    const [_, pleaseFn] = Object.entries(pleaseMap).find(([key]) => parts.find(x => x.endsWith(key))) || []
    if (typeof pleaseFn === 'string') {
        msg.commandName = pleaseFn
        msg.userParams = {
            injected: true,
            isPlease: true,
            isDM: msg.channel.type === ChannelType.DM,
            isTestingGuild: msg.guild?.id == process.env.DISCORD_TESTING_GUILD_ID,
            params: []
        }
        if (!msg.member) {
            msg.member = msg.author
        }
        commands.handleSlashCommand(msg)
    }
}

function handlePhrase(msg) {
    const input = stripPunctuation(msg.content.toLowerCase())
    const phrase = removeSpaces(phrases.getPhrase(input))
    const adjective = adjectives.getAll().find(x => input.split(' ').includes(x))
    const findInput = cleanUpSpaces(input).split(' ')
    let findResult = null
    if (findInput.length >= 6) {
        const testPhrase = findInput.slice(0, 5).join(' ')
        if (testPhrase === 'tell me a fact about') {
            findResult = true
        } else if (testPhrase === 'tell me a lie about') {
            findResult = false
        }
    }
    if (typeof findResult === 'boolean') {
        const subject = findInput.slice(5).join(' ')
        const result = construction.findSpecificTemplate(subject, findResult)
        if (result.found) {
            msg.reply(result.fact)
        } else {
            msg.channel.send(`I could not find a ${findInput[3]} for "${subject
                }" in my database.\nHere's a ${findInput[3]} about ${result.alternateSubject
                } instead:\n${result.fact}`)
        }
    } else if (phrase) {
        if (phrase.is_reply) {
            msg.reply(phrase.response)
        } else {
            msg.channel.send(phrase.response)
        }
    } else if (adjective) {
        msg.reply = (content) => {
            msg.channel.send(`Did someone say ${
                adjective}?\nThis calls for a fact!\nReady? Here it is:\n${
                content}`)
        }
        fact.response(msg, { injected: false })
    }
}

function handleSoundEffect(msg) {
    if (msg.member === null || !effectsGuilds.hasGuild(msg.guild.id)) return
    const message = removeSpaces(stripPunctuation(msg.content.toLowerCase()))
    const effect = effects.getList().find(x => message.includes(x))
    if (effect) {
        if (voice.playEffect(msg, effect)) {
            stats.updateStat(msg, 'effect')
        }
    }
}

function handleHostMessage(msg) {
    if (hosts.isHostMessage(msg) && probabilityCheck(0.05)) {
        ['🇭', '🇴', '🇸', '🇹'].forEach(x => msg.react(x))
    }
}

module.exports = {
    messageHandlers: [
        handleCommand,
        handlePlease,
        handlePhrase,
        handleSoundEffect,
        handleHostMessage
    ],
    cmdPrefix: COMMAND_PREFIX
}
