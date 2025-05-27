const Discord = require('discord.js')
const logger = require('../utils/logger')
const commands = require('./modules/commands')
const { messageHandlers } = require('./modules/messages')

const client = new Discord.Client({
    intents: [
        'Guilds',
        'GuildVoiceStates',
        'GuildMessages',
        'DirectMessages',
        'MessageContent',
        'GuildScheduledEvents'
    ],
    partials: [ Discord.Partials.Channel ]
})

client.on('ready', () => {
    // TODO setup hosts?
    // TODO schedule daily channels
    commands.registerSlashCommands(client)
    logger.info('Discord Bot initialized.')
    // TODO ai?
})

client.on('messageCreate', (msg) => {
    if (msg.author.bot) return
    if (msg.member === null) {
        log.info('Received direct message.', `${msg.author.username}: ${msg.content}`)
    }
    messageHandlers.forEach((handlerFn) => {
        try {
            handlerFn(msg)
        } catch (error) {
            logger.error('Error in message handler.', error)
        }
    })
})

client.on('guildCreate', (guild) => {
    // TODO setup host
})

client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand) {
        commands.handleSlashCommand(interaction)
    }
})

client.on('error', (err) => {
    logger.error('Discord client error.', err)
})

function init() {
    client.login(process.env.DISCORD_TOKEN)
}

module.exports = {
    init,
    client
}
