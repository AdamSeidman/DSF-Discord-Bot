/**
 * Author Adam Seidman
 * 
 * Main entry point for DSF bot
 */

const { token } = require('./token')
const Discord = require('discord.js')
const { randomNumber } = require('./utils')
const scheduler = require('../base/scheduler')
const msgHandler = require('../base/messages')
const dsfTerms = require('../db/handlers/dsf-terms')
const itemHandler = require('../db/handlers/random-items')
const setupWebServers = require('../base/web').setupWebServers

const bot = new Discord.Client()
bot.login(token) // Create bot and login

bot.on('ready', () => {
    // Run all setup items
    itemHandler.setupItems()
    dsfTerms.refreshTerms()
    scheduler.scheduleDailyChannels(bot.channels.cache.filter(x => x instanceof Discord.TextChannel))
    console.log('DSF Robot Intitialized')
    setupWebServers()
})

bot.on('message', msg => {
    // When message is incoming, send to handler
    if (!msg.author.bot) {
        msgHandler.handle(msg, msg.member === null)
    } else if (msg.author.username !== 'DSF Bot') {
        // Small chance of easter egg with other discord bots
        if (randomNumber(150) === 5) msg.reply('Shut up- bots are not meant to speak in this channel.')
    }
})