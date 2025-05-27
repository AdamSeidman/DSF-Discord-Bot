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
    client.commands = new Discord.Collection()

    fs.readdirSync(path.join(__dirname, '../commands')).forEach((file) => {
        if (path.extname(file) === '.js') {
            const phrase = file.slice(0, file.indexOf('.'))
            const cmd = require(`../commands/${phrase}`)
            if (typeof cmd.response === 'function' && !cmd.noSlashCmd) {
                cmd.data = new Discord.SlashCommandBuilder()
                    .setName(phrase)
                    .setDescription(cmd.helpMsg || cmd.altMsg || 'Command Description')
                if (cmd.hasArgs) {
                    // TODO Allow for dynamic args
                    cmd.data.addStringOption((option) => {
                        option.setName('args')
                            .setDescription('Arguments for command.')
                            .setRequired(true)
                    })
                }
                const command = {
                    phrase,
                    data: new Discord.SlashCommandBuilder()
                        .setName(phrase)
                        .setDescription(cmd.helpMsg || cmd.altMsg || 'Command Description'),
                    execute: cmd.response
                }
                client.commands.set(phrase, command)
                commands.push(command.data.toJSON())
            } 
        }
    })

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

    try {
        command.execute(interaction)
    } catch (err) {
        console.log(123) // TODO remove
        console.log(err)

        logger.error('Error in slash command: ' + interaction.commandName, err)
    }
}

module.exports = {
    registerSlashCommands,
    handleSlashCommand
}
