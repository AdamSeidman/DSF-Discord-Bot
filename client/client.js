const { token } = require('./token')
const Discord = require('discord.js')
const scheduler = require('../base/scheduler')
const msgHandler = require('../base/messages')
const dsfTerms = require('../db/handlers/dsf-terms')
const itemHandler = require('../db/handlers/random-items')
const setupWebServers = require('../base/web').setupWebServers

const bot = new Discord.Client()
bot.login(token)

bot.on('ready', () => {
    itemHandler.setupItems()
    dsfTerms.refreshTerms()
    scheduler.scheduleDailyChannels(bot.channels.cache.filter(x => x instanceof Discord.TextChannel))
    console.log('DSF Robot Intitialized')
    setupWebServers()
})

bot.on('message', msg => {
    if (!msg.author.bot) {
        msgHandler.handle(msg, msg.member === null)
    }
})