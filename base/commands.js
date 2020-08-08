const scheduler = require('./scheduler')
const Discord = require('discord.js')
const voice = require('./voice')
const { postPriusPic } = require('./prius')

var helpEmbed = undefined
const prefix = 'dsf!'

var deleteFunction = function (msg, args) {
    if (args.length < 2) {
        msg.channel.send('Delete command requires an argument.')
    } else {
        const parsed = Number.parseInt(args[1])
        if (Number.isNaN(parsed) || parsed < 1 || parsed > 10) {
            msg.channel.send('Argument should be number from 1-10.')
            return
        }
        msg.channel.bulkDelete(parsed + 1)
    }
}

var setupDailyChannel = function (msg) {
    scheduler.addDailyChannel(msg.channel)
}

var deleteDailyChannel = function (msg) {
    scheduler.removeDailyChannel(msg.channel)
}

var sendHelpMessage = function (msg) {
    let helpMessages = commandArray
        .filter(x => x.helpMsg)
        .sort((a, b) => {a.phrase - b.phrase})
        .map(cmd => {
            return {name: cmd.phrase.slice(0, 1).toUpperCase() + cmd.phrase.slice(1) + ':', value: cmd.helpMsg}
        })
    if (helpEmbed === undefined) {
        helpEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('DSF Commands List')
            .setDescription(`Enter '${prefix}' followed by desired command.`)
            .addFields(...helpMessages)
    }
    msg.channel.send(helpEmbed)
}

var commandArray = [
    {phrase: 'help', response: sendHelpMessage},
    {phrase: 'daily', response: setupDailyChannel, helpMsg: 'Sets up daily stupid facts in the channel.'},
    {phrase: 'delete', response: deleteFunction, helpMsg: 'Deletes the last (up to 10) messages in the channel.'},
    //{phrase: 'ee', response: msg => voice.playMusic(msg, 'ee')},
    {phrase: 'end-daily', response: deleteDailyChannel, helpMsg: 'Stops sending daily stupid facts to this channel.'},
    {phrase: 'fact', response: false, helpMsg: 'Sends a stupid fact.'},
    {phrase: 'lie', response: true, helpMsg: 'Sends a lie.'},
    {phrase: 'music', response: msg => voice.playRepeatMusic(msg, 'music', 0.5), helpMsg: 'Plays endless music.'},
    {phrase: 'pause', response: voice.pauseMusic, helpMsg: 'Pauses music, if playing.'},
    {phrase: 'prius', response: postPriusPic, helpMsg: 'No explanation needed.'},
    {phrase: 'resume', response: voice.resumeMusic, helpMsg: 'Resumes music, if playing.'},
    {phrase: 'stop', response: voice.stopMusic, helpMsg: 'Stops music and removed bot from voice channel.'}
]

module.exports = {
    commands: commandArray,
    prefix: prefix
}