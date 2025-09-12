const storage = require("node-persist")
const voice = require("./modules/voice")
const logger = require("@adamseidman/logger")
const commands = require("./modules/commands")
const { handleDM } = require("./modules/directMessages")
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

global.bot = {}
global.owner = {}

client.once(Events.ClientReady, async ({ user }) => {
    const channelIds = require("@tables/dailies").getAll().map(x => x.channelId)
    require("@facts/scheduler").scheduleDailyChannels(channelIds)
    await commands.registerSlashCommands(client)
    global.bot = client.user
    client.application.fetch()
        .then(() => {
            global.owner = client.application.owner
            if (!global.DEBUG) {
                return global.owner.send('Bot online.')
            }
        })
        .catch(logger.fatal)
    logger.info(`Discord Bot initialized.
        Logged in as ${user.username}#${user.discriminator}.`)
})

client.on(Events.MessageCreate, (msg) => {
    if (msg.author.bot) return
    if (msg.member === null) {
        handleDM(msg)
    }
    messageHandlers.forEach(async (handlerFn) => {
        try {
            await handlerFn(msg)
        } catch (error) {
            logger.error('Error in message handler.', error)
        }
    })
})

client.on(Events.InteractionCreate, (interaction) => {
    if (interaction.isChatInputCommand()) {
        commands.handleSlashCommand(interaction)
            .catch(logger.error)
    }
})

if (global.DEBUG) {
    client.on(Events.Debug, logger.debug)
    client.on(Events.Warn, logger.warn)
}
client.on(Events.Error, logger.error)

client.init = async () => {
    global.discordToken = (global.DEBUG && process.env.DISCORD_TOKEN_ALT)?
        process.env.DISCORD_TOKEN_ALT : process.env.DISCORD_TOKEN
    if (await storage.getItem('isMobile')) {
        DefaultWebSocketManagerOptions.identifyProperties.browser = 'Discord iOS'
    }
    client.options.presence = await storage.getItem('presence')
    await client.login(global.discordToken)
}

client.close = async () => {
    await voice.stopAll()
    await client.destroy()
}

module.exports = client
