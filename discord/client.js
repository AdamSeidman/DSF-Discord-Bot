const voice = require("./modules/voice")
const logger = require("@adamseidman/logger")
const commands = require("./modules/commands")
const { messageHandlers } = require("./modules/messages")
const { Client, GatewayIntentBits, Partials, ActivityType } = require("discord.js")

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
    process.bot = client.user
    await client.user.setActivity(process.dsf.activityText, { type: ActivityType.Custom })
    client.application.fetch()
        .then(() => {
            process.owner = client.application.owner
        })
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
    if (interaction.isChatInputCommand()) {
        commands.handleSlashCommand(interaction)
    }
})

client.on('error', (error) => {
    logger.error('Discord client error.', error)
})

function init() {
    process.discordToken = process.DEBUG?
        process.env.DISCORD_TOKEN_ALT : process.env.DISCORD_TOKEN
    client.login(process.discordToken)
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
