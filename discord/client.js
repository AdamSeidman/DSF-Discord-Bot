const voice = require("./modules/voice")
const logger = require("@adamseidman/logger")
const commands = require("./modules/commands")
const { messageHandlers } = require("./modules/messages")
const { Client, GatewayIntentBits, Partials } = require('discord.js')

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildScheduledEvents
    ],
    partials: [ Partials.Channel ]
})

client.on('ready', async () => {
    const channelIds = require("../db/tables/dailies").getAll().map(x => x.channelId)
    require("../fact/scheduler").scheduleDailyChannels(channelIds)
    await commands.registerSlashCommands(client)
    logger.info('Discord Bot initialized.')
})

client.on('messageCreate', (msg) => {
    if (msg.author.bot) return
    if (msg.member === null) {
        logger.info('Received direct message.', `${msg.author.username}: ${msg.content}`)
    }
    messageHandlers.forEach((handlerFn) => {
        try {
            handlerFn(msg)
        } catch (error) {
            logger.error('Error in message handler.', error)
        }
    })
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

async function close() {
    await voice.stopAll()
    await client.destroy()
}

module.exports = {
    init,
    close,
    client
}
