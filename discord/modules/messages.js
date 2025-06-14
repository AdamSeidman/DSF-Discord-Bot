const fs = require("fs")
const path = require("path")
const voice = require("./voice")
const Discord = require("discord.js")
const commands = require("./commands")
const hosts = require("@tables/hosts")
const stats = require("@tables/stats")
const fact = require("../commands/fact")
const effects = require("@media/effects")
const phrases = require("@tables/phrases")
const adjectives = require("@tables/adjectives")
const construction = require("@facts/construction")
const effectsGuilds = require("@tables/effectsGuilds")
const { copyObject, stripPunctuation, removeSpaces, cleanUpSpaces,
    probabilityCheck, matchesDiscordId} = require("logic-kit")

const COMMAND_PREFIX = global.DEBUG? 'd!' : 'dsf!'
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
        isDM: msg.channel.type === Discord.ChannelType.DM,
        isTestingGuild: msg.guild?.id == process.env.DISCORD_TESTING_GUILD_ID,
        params: copyObject(message)
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
            isDM: msg.channel.type === Discord.ChannelType.DM,
            isTestingGuild: msg.guild?.id == process.env.DISCORD_TESTING_GUILD_ID,
            params: []
        }
        commands.handleSlashCommand(msg)
    }
}

function getFindRequestPhrase(message) {
    message = cleanUpSpaces(message.toLowerCase()).split(' ')
    const result = {
        hasPhrase: false,
        isMe: true,
        user: '',
        isFact: null,
        factPhrase: message[3],
        subject: ''
    }
    if (message.length < 6) {
        return result
    }
    if (message[0] !== 'give' && message[0] !== 'tell') {
        return result
    }
    const userId = matchesDiscordId(message[1])
    if (userId) {
        result.user = Discord.userMention(userId) + '\n',
        result.isMe = false
    } else if (message[1] !== 'me') {
        return result
    }
    if (message[2] !== 'a' || message[4] !== 'about') {
        return result
    }
    if (message[3] === 'fact' || message[3] === 'lie') {
        result.isFact = (message[3] === 'fact')
        result.hasPhrase = true
    }
    result.subject = message.slice(5).join(' ')
    return result
}

function handlePhrase(msg) {
    const input = stripPunctuation(msg.content.toLowerCase())
    const phrase = phrases.getPhrase(removeSpaces(input))
    const adjective = adjectives.getAll().find(x => input.split(' ').includes(x))
    const findResult = getFindRequestPhrase(input)

    if (findResult.hasPhrase) {
        const result = construction.findSpecificTemplate(findResult.subject, findResult.isFact)
        if (result.found) {
            if (findResult.isMe) {
                msg.reply(result.fact)
            } else {
                msg.channel.send(`${findResult.user}${result.fact}`)
            }
        } else {
            msg.channel.send(`${findResult.user}I could not find a ${findResult.factPhrase} for "${
                findResult.subject}" in my database.\nHere's a ${findResult.factPhrase} about ${
                result.alternateSubject} instead:\n${result.fact}`)
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
            stats.updateStat(msg.member, 'effect')
        }
    }
}

function handleHostMessage(msg) {
    if (!!msg.member && hosts.isHostMessage(msg) && probabilityCheck(global.dsf.hostReactionFrequency)) {
        ['🇭', '🇴', '🇸', '🇹'].forEach(x => msg.react(x))
    }
}

function handleMentions(msg) {
    if (!!msg.member && msg.content.includes(Discord.userMention(global.bot.id))) {
        msg.reply({
            content: 'My reaction to that information:',
            files: [{ attachment: './assets/logo.png' }]
        })
    }
}

module.exports = {
    messageHandlers: [
        handleCommand,
        handlePlease,
        handlePhrase,
        handleSoundEffect,
        handleHostMessage,
        handleMentions
    ],
    cmdPrefix: COMMAND_PREFIX
}
