/**
 * Author: Adam Seidman
 * 
 * Main entry point for DSF bot
 */

const config = require('./config')
const utils = require('../base/utils')
const Discord = require('discord.js')
const scheduler = require('../base/scheduler')
const { randomNumber } = require('../base/utils')
const dsfTerms = require('../db/handlers/dsf-terms')
const { messageHandlers  } = require('../base/messages')
const itemHandler = require('../db/handlers/random-items')
const setupWebServers = require('../base/web').setupWebServers

const bot = new Discord.Client({ intents: config.intents, partials: config.partials })
bot.login(config.token) // Create bot and login

bot.on('ready', () => {
    // Run all setup items
    itemHandler.setupItems()
    dsfTerms.refreshTerms()
    scheduler.scheduleDailyChannels(bot.channels.cache.filter(x => x instanceof Discord.TextChannel))
    if (config.options.hasWebInterface) {
        setupWebServers()
    }
    utils.getChannelById = id => bot.channels.cache.filter(x => x instanceof Discord.TextChannel).find(x => x.id === id)
    utils.getUserById = async id => await bot.users.fetch(id)
    if (config.options.hasSlashCommands) {
        require('../base/commands').registerSlashCommands(bot)
    }
    console.log('DSF Robot Intitialized')
})
    
bot.on('messageCreate', msg => {
    // When message is incoming, send to handler
    if (!msg.author.bot) {
        // Run normal DSF functions with users
        messageHandlers.forEach(x => x(msg, msg.member === null))
    } else if (config.botId !== undefined && msg.author.id !== config.botId) {
        // Small chance of easter egg with other discord bots
        if (randomNumber(config.probabilities.botEasterEgg) === 5) msg.reply(config.botEasterEggText)
    }
})

bot.on('interactionCreate', async interaction => {
    if (!config.options.hasSlashCommands || !interaction.isChatInputCommand()) return
    require('../base/commands').handleSlashCommand(interaction)
})

bot.on('error', console.error)
