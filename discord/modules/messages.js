const fs = require("fs")
const path = require("path")
const Discord = require("discord.js")
const commands = require("./commands")
const hosts = require("@tables/hosts")
const logger = require("@adamseidman/logger")
const { messageHandlers: extraHandlers } = require("./addons")
const { copyObject, toParts, probabilityCheck } = require("logic-kit")

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
    message = toParts(message.slice(COMMAND_PREFIX.length))
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
        .catch(logger.error)
}


function handleHostMessage(msg) {
    if (!!msg.member && hosts.isHostMessage(msg) && probabilityCheck(global.dsf.hostReactionFrequency)) {
        ['🇭', '🇴', '🇸', '🇹'].forEach(x => msg.react(x).catch(logger.warn))
    }
}

function handleMentions(msg) {
    if (!!msg.member && msg.content.includes(Discord.userMention(global.bot.id))) {
        return msg.reply({
            content: 'My reaction to that information:',
            files: [{ attachment: './assets/logo.png' }]
        })
    }
}

module.exports = {
    messageHandlers: [
        handleCommand,
        handleHostMessage,
        handleMentions,
        ...extraHandlers
    ],
    cmdPrefix: COMMAND_PREFIX
}
