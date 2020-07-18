var msgHandler = require('./handlers/message-handler')
var serverInfo = require('./handlers/server-info-handler')
const token = require('./token').token
const Discord = require('discord.js')

const bot = new Discord.Client()
bot.login(token)

bot.on('ready', () => {
    // dbHandler.setUpDatabases() TODO
    console.log('Facts are online, B')
})

bot.on('message', msg => {
    if (!msg.member.user.bot) {
        msgHandler.handle(msg)
    }
})