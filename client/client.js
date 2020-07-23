const token = require('./token').token
const Discord = require('discord.js')
const scheduler = require('../base/scheduler')
const msgHandler = require('../base/messages')
const itemHandler = require('../db/handlers/random-items')

const bot = new Discord.Client()
bot.login(token)

bot.on('ready', () => {
    itemHandler.setupItems()
    scheduler.scheduleDailyChannels(bot.channels.cache.filter(x => x instanceof Discord.TextChannel))
    console.log('DSF Robot Intitialized')
})

bot.on('message', msg => {
    if (!msg.author.bot) {
        msgHandler.handle(msg, msg.member === null)
    }
})