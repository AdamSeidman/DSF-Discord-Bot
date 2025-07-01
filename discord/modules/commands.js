const fs = require("fs")
const path = require("path")
const Discord = require("discord.js")
const logger = require("@adamseidman/logger")

let testingGuild = {}

async function registerSlashCommands(client) {
    if (!client) {
        logger.error('No client while registering slash commands.', client)
        return
    }

    const commands = []
    const testerCommands = []
    const helpMessages = {}
    client.commands = new Discord.Collection()
    testingGuild = [...client.guilds.cache.values()].find(x => x.id === process.env.DISCORD_TESTING_GUILD_ID)
    if (testingGuild?.commands) {
        testingGuild.commands = new Discord.Collection()
    } else {
        testingGuild = {}
        logger.error('Could not find testing guild.', testingGuild)
    }

    const cmdDir = global.clearSlashCommands? '../logs' : '/commands'
    fs.readdirSync(path.join(__dirname, `../${cmdDir}`)).forEach((file) => {
        if (path.extname(file) === '.js') {
            const phrase = file.slice(0, file.indexOf('.'))
            const cmd = require(`../${cmdDir}/${phrase}`)
            if (!cmd || typeof cmd.response !== 'function') return

            cmd.data = new Discord.SlashCommandBuilder()
                .setName(phrase)
                .setDescription(cmd.helpMsg || cmd.altMsg || '[Command Description]')
            if (typeof cmd.argModifier === 'function') {
                cmd.argModifier(cmd.data)
            }
            const command = {
                phrase,
                data: cmd.data,
                execute: cmd.response
            }

            if (cmd.isTesterCommand) {
                testingGuild.commands.set(phrase, command)
                testerCommands.push(command.data.toJSON())
            } else {
                client.commands.set(phrase, command)
                commands.push(command.data.toJSON())
                if (typeof cmd.helpMsg === 'string') {
                    helpMessages[phrase] = cmd.helpMsg
                }
            }
        }
    })

    require("../commands/help").buildEmbed(helpMessages)

    const rest = new Discord.REST().setToken(global.discordToken)

    try {
        logger.info(`Refreshing ${commands.length} application slash commands.`)
        await rest.put(
            Discord.Routes.applicationCommands(client.user.id),
            { body: commands }
        )
        logger.info(`Refreshing ${testerCommands.length} tester guild slash commands.`)
        await rest.put(
            Discord.Routes.applicationGuildCommands(client.user.id, process.env.DISCORD_TESTING_GUILD_ID),
            { body: testerCommands }
        )
    } catch (error) {
        logger.fatal('Could not deploy slash commands.', error)
    }
    logger.debug('Finished reloading slash commands.')
}

async function handleSlashCommand(interaction) {
    let command = interaction.client.commands.get(interaction.commandName)
    const isTestingGuild = interaction.guild?.id == process.env.DISCORD_TESTING_GUILD_ID
    const isDM = interaction.channel?.type === Discord.ChannelType.DM

    const params = interaction.userParams || {
        injected: false,
        isPlease: false,
        isTestingGuild,
        isDM
    }
    params.user = (interaction.member || interaction.author || interaction.user)

    if (!command && (isTestingGuild || params.user.id == global.owner?.id)) {
        command = testingGuild.commands.get(interaction.commandName)
    }
    if (!command) {
        if (testingGuild.commands.get(interaction.commandName)) {
            logger.debug(`Internal command requested outside of testing guild by ${params.user.username}.`,
                interaction.commandName)
            return
        }
        if (isDM) {
            logger.error('Requested slash command not found', command)
        }
        interaction.reply({
            content: isDM? 'Command unavailable.' : 'Internal Error! Command not found.',
            flags: Discord.MessageFlags.Ephemeral
        })
        return
    }

    try {
        command.execute(interaction, params)
    } catch (error) {
        logger.error('Error in slash command: ' + interaction.commandName, error)
    }
}

module.exports = {
    registerSlashCommands,
    handleSlashCommand
}
