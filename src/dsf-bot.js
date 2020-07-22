const token = require('./token').token
const Discord = require('discord.js')
const scheduler = require('./handlers/scheduler')
const msgHandler = require('./handlers/messages')
const itemHandler = require('./handlers/random-items')

const bot = new Discord.Client()
bot.login(token)

bot.on('ready', () => {
    itemHandler.setupItems()
    scheduler.scheduleDailyChannels(bot.channels.cache.filter(x => x instanceof Discord.TextChannel))
    console.log('DSF Robot Intitialized')
})

bot.on('message', msg => {
    if (!msg.member.user.bot) {
        msgHandler.handle(msg)
    }
})