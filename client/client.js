/**
 * Author: Adam Seidman
 * 
 * Main entry point for DSF bot
 */

const config = require('./config')
const utils = require('poop-sock')
const Discord = require('discord.js')
const scheduler = require('../base/scheduler')
const log = require('better-node-file-logger')
const { setupWebServers } = require('../base/web')
const dsfTerms = require('../db/handlers/dsf-terms')
const serverInfo = require('../db/handlers/server-info')
const { messageHandlers  } = require('../base/messages')
const itemHandler = require('../db/handlers/random-items')

const bot = new Discord.Client({ intents: config.intents, partials: config.partials })
bot.login(config.token) // Create bot and login

bot.on('ready', () => {
    // Run all setup items
    log.quickInit(config.constants.loggingPrefix)
    serverInfo.setupHostServers(bot.guilds.cache)
    itemHandler.setupItems()
    dsfTerms.refreshTerms()
    if (config.options.hasSoundEffects) {
        serverInfo.setupEffectsServers()
    }
    scheduler.scheduleDailyChannels(bot.channels.cache.filter(x => x instanceof Discord.TextChannel))
    if (config.options.hasWebInterface) {
        setupWebServers()
    }
    utils.registerDiscordContext(bot)
    if (config.options.hasSlashCommands) {
        require('../base/commands').registerSlashCommands(bot)
    }
    log.info('DSF Bot Intitialized')
})
    
bot.on('messageCreate', msg => {
    // When message is incoming, send to handler
    if (!msg.author.bot) {
        // Run normal DSF functions with users
        messageHandlers.forEach(x => x(msg, msg.member === null))
    } else if (config.botId !== undefined && msg.author.id !== config.botId) {
        // Small chance of easter egg with other discord bots
        if (utils.randomNumber(config.probabilities.botEasterEgg) === 5) msg.reply(config.botEasterEggText)
    }
})

bot.on('interactionCreate', async interaction => {
    if (!config.options.hasSlashCommands || !interaction.isChatInputCommand()) return
    require('../base/commands').handleSlashCommand(interaction)
})

bot.on('error', err => {
    log.error('Client Error', err)
})
