const fs = require("fs")
const path = require("path")
const voice = require("./voice")
const commands = require("./commands")
const { ChannelType } = require("discord.js")
const hosts = require("../../db/tables/hosts")
const stats = require("../../db/tables/stats")
const effects = require("../../db/media/effects")
const phrases = require("../../db/tables/phrases")
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

function handlePhrase(msg) { // TODO adjectives
    let phrase = removeSpaces(phrases.getPhrase(stripPunctuation(msg.content.toLowerCase())))
    if (phrase) {
        if (phrase.is_reply) {
            msg.reply(phrase.response)
        } else {
            msg.channel.send(phrase.response)
        }
    }
}

function handleSoundEffect(msg) {
    if (msg.member === null || !effectsGuilds.hasGuild(msg.guild.id)) return
    const message = removeSpaces(stripPunctuation(msg.content.toLowerCase()))
    const effect = effects.getList().find(x => message.includes(x))
    if (effect) {
        voice.playEffect(msg, effect)
        stats.updateStat(msg, 'effect')
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
