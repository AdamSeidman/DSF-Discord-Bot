var msgHandler = require('./message-handler')
const token = require('./token').token
const Discord = require('discord.js')
const bot = new Discord.Client()

bot.login(token)

bot.on('ready', ()=> {
    console.log("Facts are online, B")
})

bot.on('message', msg => {
    if (msg.member.user.username !== 'DSF Bot') {
        msgHandler.handle(msg)
    }
})