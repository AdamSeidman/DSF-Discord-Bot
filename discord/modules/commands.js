const fs = require('fs')
const path = require('path')
const Discord = require('discord.js')
const logger = require('../../utils/logger')

function registerSlashCommands(client) {
    if (!client) {
        logger.error('No client while registering slash commands.', client)
        return
    }

    const commands = []
    const helpMessages = {}
    client.commands = new Discord.Collection()

    fs.readdirSync(path.join(__dirname, '../commands')).forEach((file) => {
        if (path.extname(file) === '.js') {
            const phrase = file.slice(0, file.indexOf('.'))
            const cmd = require(`../commands/${phrase}`)
            if (!cmd || typeof cmd.response !== 'function') return

            if (!cmd.isSlashCommand) return // TODO

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
            client.commands.set(phrase, command)
            if (cmd.isSlashCommand) {
                commands.push(command.data.toJSON())
            }
            if (typeof cmd.helpMsg === 'string') {
                helpMessages[phrase] = cmd.helpMsg
            }
        }
    })

    require('../commands/help').buildEmbed(helpMessages)

    const rest = new Discord.REST().setToken(process.env.DISCORD_TOKEN)

    try {
        // TODO make certain commands bot testing only
        logger.info(`Refreshing ${commands.length} application slash commands.`)
        rest.put(Discord.Routes.applicationCommands(process.env.DISCORD_BOT_ID), {body: commands})
    } catch (err) {
        logger.fatal('Could not deploy slash commands.', err)
    }
    logger.debug('Finished reloading slash commands.')
}

async function handleSlashCommand(interaction) {
    const command = interaction.client.commands.get(interaction.commandName)
    if (!command) {
        logger.error('Requested slash command not found', command)
        interaction.reply({
            content: 'Internal Error! Command not found.',
            ephemeral: true
        })
        return
    }

    const params = interaction.userParams || {
        injected: false,
        isPlease: false,
        isDM: interaction.channel?.type === Discord.ChannelType.DM,
        isTestingGuild: interaction.guild?.id == process.env.DISCORD_TESTING_GUILD_ID
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
