const storage = require("node-persist")
const voice = require("./modules/voice")
const logger = require("@adamseidman/logger")
const commands = require("./modules/commands")
const { messageHandlers } = require("./modules/messages")
const { Client, Events, GatewayIntentBits, Partials,
    DefaultWebSocketManagerOptions } = require("discord.js")

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [ Partials.Channel ]
})

client.once(Events.ClientReady, async ({ user }) => {
    const channelIds = require("@tables/dailies").getAll().map(x => x.channelId)
    require("@facts/scheduler").scheduleDailyChannels(channelIds)
    await commands.registerSlashCommands(client)
    global.bot = client.user
    client.application.fetch()
        .then(() => {
            global.owner = client.application.owner
        })
    logger.info(`Discord Bot initialized.
        Logged in as ${user.username}#${user.discriminator}.`)
})

client.on(Events.MessageCreate, (msg) => {
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

client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand()) {
        commands.handleSlashCommand(interaction)
    }
})

client.on(Events.Error, (error) => {
    logger.error('Discord client error.', error)
})

async function init() {
    global.discordToken = global.DEBUG?
        process.env.DISCORD_TOKEN_ALT : process.env.DISCORD_TOKEN
    if (await storage.getItem('isMobile')) {
        DefaultWebSocketManagerOptions.identifyProperties.browser = 'Discord iOS'
    }
    client.options.presence = await storage.getItem('presence')
    client.login(global.discordToken)
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
