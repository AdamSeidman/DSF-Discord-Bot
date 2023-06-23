/**
 * Author: Adam Seidman
 * 
 * Main entry point for DSF bot
 */

const { token, botId } = require('./config')
const utils = require('../base/utils')
const Discord = require('discord.js')
const scheduler = require('../base/scheduler')
const { randomNumber } = require('../base/utils')
const dsfTerms = require('../db/handlers/dsf-terms')
const { messageHandlers  } = require('../base/messages')
const itemHandler = require('../db/handlers/random-items')
const setupWebServers = require('../base/web').setupWebServers

// Bot Intentions/Partials
const myIntents = ['Guilds', 'GuildVoiceStates', 'GuildMessages', 'DirectMessages',
    'MessageContent', 'GuildScheduledEvents']
const myPartials = [Discord.Partials.Channel]

const bot = new Discord.Client({ intents: myIntents, partials: myPartials })
bot.login(token) // Create bot and login

bot.on('ready', () => {
    // Run all setup items
    itemHandler.setupItems()
    dsfTerms.refreshTerms()
    scheduler.scheduleDailyChannels(bot.channels.cache.filter(x => x instanceof Discord.TextChannel))
    setupWebServers()
    utils.getChannelById = id => bot.channels.cache.filter(x => x instanceof Discord.TextChannel).find(x => x.id === id)
    utils.getUserById = async id => await bot.users.fetch(id)
    require('../base/commands').registerSlashCommands(bot)
    console.log('DSF Robot Intitialized')
})
    
bot.on('messageCreate', msg => {
    // When message is incoming, send to handler
    if (!msg.author.bot) {
        // Run normal DSF functions with users
        messageHandlers.forEach(x => x(msg, msg.member === null))
    } else if (botId !== undefined && msg.author.id !== botId) {
        // Small chance of easter egg with other discord bots
        if (randomNumber(1500) === 5) msg.reply('Shut up- bots are not meant to speak in this channel.')
    }
})

bot.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return
    require('../base/commands').handleSlashCommand(interaction)
})

bot.on('error', console.error)
