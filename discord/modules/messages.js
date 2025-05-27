const fs = require('fs')
const path = require('path')
const voice = require('./voice')
const commands = require('./commands')
const effects = require('../../db/media/effects')
const phrases = require('../../db/tables/phrases')
const { stripPunctuation } = require('../../utils/utils')
const effectsGuilds = require('../../db/tables/effectsGuilds')

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
    message = message.slice(COMMAND_PREFIX.length).replace(/\s+/g, ' ').trim().split(' ')
    msg.commandName = message.shift().toLowerCase()
    if (!availableCommands.includes(msg.commandName)) return
    if (!msg.options) {
        msg.options = {}
    }
    msg.options.getString = () => message.join(' ')
    commands.handleSlashCommand(msg)
}

const pleaseFunctions = {
    fact: (msg) => {
        msg.reply('1')
    },
    lie: (msg) => {
        msg.reply('2')
    },
    prius: (msg) => {
        msg.reply('3')
        // msg.reply({content: 'Ya like jazz?', files: [{attachment: prius.getRandomImage()}]})
    },
    acronym: (msg) => {
        msg.reply('4')
    },
    gibberish: (msg) => {
        msg.reply('5')
    }
}

function handlePlease(msg) {
    let parts = stripPunctuation(msg.content).replace(/\s+/g, '').toLowerCase().split('please')
    parts.pop()
    if (parts.length < 1) return
    const [_, fn] = Object.entries(pleaseFunctions).find(([key]) => parts.find(x => x.endsWith(key))) || []
    if (typeof fn === 'function') {
        fn(msg)
    }
}

function handlePhrase(msg) {
    let phrase = phrases.getPhrase(stripPunctuation(msg.content.toLowerCase()).replace(/\s+/g, ''))
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
    const message = stripPunctuation(msg.content.toLowerCase()).replace(/\s+/g, '')
    const effect = effects.getList().find(x => message.includes(x))
    if (effect) {
        voice.playEffect(msg, effect)
    }
}

module.exports = {
    messageHandlers: [
        handleCommand,
        handlePlease,
        handlePhrase,
        handleSoundEffect
    ]
}
