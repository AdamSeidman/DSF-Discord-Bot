/**
 * Author: Adam Seidman
 * 
 * Main entry point for DSF bot
 */

const { token } = require('./token')
const Discord = require('discord.js')
const scheduler = require('../base/scheduler')
const { randomNumber } = require('../base/utils')
const dsfTerms = require('../db/handlers/dsf-terms')
const { messageHandlers  }= require('../base/messages')
const itemHandler = require('../db/handlers/random-items')
const setupWebServers = require('../base/web').setupWebServers

// Bot Intentions
const myIntents = ['Guilds', 'GuildVoiceStates', 'GuildMessages', 'DirectMessages',
    'MessageContent', 'GuildScheduledEvents']

const bot = new Discord.Client({ intents: myIntents })
bot.login(token) // Create bot and login

bot.on('ready', () => {
    // Run all setup items
    itemHandler.setupItems()
    dsfTerms.refreshTerms()
    scheduler.scheduleDailyChannels(bot.channels.cache.filter(x => x instanceof Discord.TextChannel))
    console.log('DSF Robot Intitialized')
    setupWebServers()
})

bot.on('messageCreate', msg => {
    // When message is incoming, send to handler
    if (!msg.author.bot) {
        // Run normal DSF functions with users
        messageHandlers.forEach(x => x(msg, msg.member === null))
    } else if (msg.author.username !== 'DSF Bot') {
        // Small chance of easter egg with other discord bots
        if (randomNumber(1500) === 5) msg.reply('Shut up- bots are not meant to speak in this channel.')
    }
})
