const token = require('./token').token
const Discord = require('discord.js')
const scheduler = require('./handlers/scheduling-handler')
const msgHandler = require('./handlers/message-handler')

const bot = new Discord.Client()
bot.login(token)

bot.on('ready', () => {
    scheduler.scheduleDailyChannels(bot.channels.cache.filter(x => x instanceof Discord.TextChannel))
    console.log('DSF Robot Intitialized')
})

bot.on('message', msg => {
    if (!msg.member.user.bot) {
        msgHandler.handle(msg)
    }
})