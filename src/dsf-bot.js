const token = require('./token').token
const Discord = require('discord.js')
const scheduler = require('./handlers/scheduling-handler')
const msgHandler = require('./handlers/message-handler')

const bot = new Discord.Client()
bot.login(token)

bot.on('ready', () => {
    scheduler.scheduleDailyChannels()
    console.log('Facts are online, B')
})

bot.on('message', msg => {
    if (!msg.member.user.bot) {
        msgHandler.handle(msg)
    }
})