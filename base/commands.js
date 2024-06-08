/**
 * Author: Adam Seidman
 * 
 * All functions and a list of command dict's are defined here.
 * 
 * Exports:
 *     commands: Array of commands
 *         -Each command will have guaranteed 'phrase' and 'response' with msg param
 *         -(optional) Message for help embed: 'helpMsg'
 *     sendDsfAcronym: Function to send DSF phrase.
 *         -params:
 *             +msg: originating discord message
 *             +loud: boolean, determines if TTS is True
 *             +isPhrase: boolean, True is reply, False is channel msg
 *     registerSlashCommands: Send command list to Discord for (/) commands
 *         -params:
 *             +client: Discord.js client object
 *     handleSlashCommand: Handle incoming interactions that have commands
 *         -params:
 *             +interaction: The discord interaction object
 */

const scheduler = require('./scheduler')
const Discord = require('discord.js')
const voice = require('./voice')
const dsfTerms = require('../db/handlers/dsf-terms')
const { postPriusPic } = require('./prius')
const { randomArrayItem, restartApp, randomEmoji, matchesDiscordId, getUserById } = require('poop-sock')
const serverHandler = require('../db/handlers/server-info')
const config = require('../client/config')
const { constructFact, getGibberish } = require('./facts')
const stats = require('../db/handlers/stats')
const randomItems = require('../db/handlers/random-items')
const log = require('better-node-file-logger')
const { repickEvent } = require('./host')

var helpEmbed = undefined
const prefix = config.constants.commandPrefix

const MIN_SILENCE_SECONDS = 60 * config.constants.minSilenceMinutes
const MAX_SILENCE_SECONDS = 60 * config.constants.maxSilenceMinutes

var sendOrReply = function (msg, content, ephemeral) {
    if (msg.author && !ephemeral) {
        msg.channel.send(content)
    } else {
        msg.reply({content: content, ephemeral: ephemeral})
    }
}

// Command tells the schedules to add or remove a discord channel from list of dsf's
var setupDailyChannel = function (msg) {
    scheduler.addDailyChannel(msg.channel)
}

var deleteDailyChannel = function (msg) {
    scheduler.removeDailyChannel(msg.channel)
}

// Deletes 1 - 10 previous discord messages
// (Adds 1 to remove 'dsf!delete' command/message)
var deleteFunction = function (msg, args) {
    if (!config.options.hasDeleteFunction) return
    if (args.length < 2) {
        // args[0] is message; the rest are arguments (space delimited)
        msg.channel.send('Delete command requires an argument.')
    } else {
        const parsed = Number.parseInt(args[1])
        if (Number.isNaN(parsed) || parsed < 1 || parsed > 10) {
            sendOrReply(msg, 'Argument should be number from 1-10.')
            return
        }
        msg.channel.bulkDelete(parsed + 1) // Bulk delete
    }
}

// Send mean message. Also react to the message with random emoji.
var bullyReact = async function (msg, args) {
    let id = matchesDiscordId(args[1])
    if (id === null) {
        sendOrReply(msg, 'Argument was not a Discord user.', true)
        if (msg.react) msg.react(randomEmoji())
        log.warn('Bully react requested, but argument was invalid.')
        return
    }
    if (`${id}` === config.botId) {
        if (msg.react) {
            for (let i = 0; i < 20; i++) {
                msg.react(randomEmoji())
            }
        }
        sendOrReply(msg, 'You want me to bully myself? Pathetic...')
        return
    }
    let channel = await getUserById(id)
    if (channel === undefined) {
        sendOrReply(msg, 'Discord user was not valid.', true)
        log.warn('Bully react requested, but user was invalid.')
    } else {
        let message = `<@${msg.member.id}> told me that you ${randomArrayItem([
            'suck', 'smell', 'eat paste', 'drink lake water', 'don\'t love your mom', 'remind them of crickets', 'don\'t actually exist'
        ])}.`
        let subMessage = [...args].splice(2).join(' ')
        if (args.length > 2 && subMessage.length > 1) {
            message += ` Also they said "*${subMessage}*"${subMessage.charAt(subMessage.length - 1) == '.'? '' : '.'}`
        }
        try {
            channel.send(message)
            log.info(`Bully message sent to <@${channel.id}>`, message)
            if (!msg.author) sendOrReply(msg, 'Message sent.', true)
        } catch (err) {
            log.info(`Bully message was not sent from <@${msg.member.id}> to <@${channel.id}>.`, err)
            sendOrReply(msg, 'Could not send a message to that user.', true)
        }
    }
    if (msg.react) msg.react(randomEmoji())
}

const acceptedResponses = { // For sound effects arguments
    true: ['true', '1'],
    false: ['false', '0']
}

// Set sound effects enabled or disabled
var setSoundEffectsEnabled = function (msg, args) {
    if (args.length < 2) {
        // args[0] is message; the rest are arguments (space delimited)
        msg.channel.send('Command requires an argument.')
    } else {
        let argument = args[1].toLowerCase().trim()

        if (![...acceptedResponses.true, ...acceptedResponses.false].includes(argument)) {
            msg.channel.send('Argument should be True or False.')
            return
        }
        // Tell server handler to make database call
        log.info(`Sound effect options modified in server ${msg.guild.id}.`)
        serverHandler.modifyEffectsServerDB(msg.channel, acceptedResponses.true.includes(argument))
    }
}

// Send help embed to channel when requested
var sendHelpMessage = function (msg) {
    let helpMessages = commandArray
        .filter(x => x.helpMsg)
        .sort((a, b) => {a.phrase - b.phrase})
        .map(cmd => {
            return {name: cmd.phrase.slice(0, 1).toUpperCase() + cmd.phrase.slice(1) + ':', value: cmd.helpMsg}
        }) // All command array helpMsg's

    if (helpEmbed === undefined) {
        // Only create help embed once. It is saved as an object
        helpEmbed = new Discord.EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('DSF Commands List')
            .setDescription(`Enter '${prefix}' or '/' followed by desired command.`)
            .addFields(...helpMessages)
            
        sendOrReply(msg, {embeds: [helpEmbed]})
    } else {
        // Wait for embed builder to be complete
        sendOrReply(msg, {embeds: [helpEmbed]})
    }
}

// Send a DSF acronym message.
// Can potentially move this function somewhere else (?)
var sendDsfAcronym = function (msg, loud, isPhrase) {
    if (!config.options.hasAcronyms) return
    const acronym = `${randomArrayItem(dsfTerms.getAdverbs())} ${randomArrayItem(dsfTerms.getAdjectives())} ${randomArrayItem(dsfTerms.getNouns())}.`
    if (isPhrase) {
        msg.reply({content: acronym, tts: loud})
    } else {
        sendOrReply(msg, {content: acronym, tts: loud})
    }
}

// Send list of available sound effects as reply
var sendEffectsList = function (msg) {
    if (voice.effects.length === 0) {
        msg.reply('There are currently no sound effects in the system.')
    }
    let message = JSON.stringify(voice.effects).substring(2).split('"').join('')
    msg.reply(message.substring(0, message.length - 1).split(',').join(', '))
}

// Fact check a template message
var factCheck = function (msg, lcArgs, args) {
    if (args === undefined) {
        args = [0]
    }
    args.shift()
    let template = args.join(' ')
    if (template.length == 0 || template.charAt(0) !== '[') {
        sendOrReply(msg, 'You need to send a fact template.')
        return
    }
    let builder = [`Provided template:\n> ${template}\n\nTen sample facts:\n`]
    log.info('Received new fact template.', template)
    try {
        template = JSON.parse(template)
    } catch (err) {
        sendOrReply(msg, 'Input was not valid JSON.')
        return
    }
    for (let i = 0; i < 10; i++) {
        builder.push(`> ${constructFact(template, false)}\n`)
    }
    builder.push('\nTen sample lies:\n')
    for (let i = 0; i < 10; i++) {
        builder.push(`> ${constructFact(template, true)}\n`)
    }
    let out = []
    while (builder.length > 0) {
        if (out.join('').concat(builder[0]).length >= 2000) {
            sendOrReply(msg, out.join(''))
            out = []
        }
        out.push(builder.shift())
    }
    sendOrReply(msg, out.join(''))
}

// Restart the software
var restart = function (msg, args) {
    if (!config.options.allowsRestart) return
    if (msg.member.id == config.adminId) {
        args.shift()
        if (args.length === 0) {
            args = ['Generic Restart']
        } else {
            args.forEach((item, index) => {
                if (item.length > 1) {
                    args[index] = item.slice(0, 1).toUpperCase().concat(item.slice(1))
                }
            })
        }
        log.warn('Bot restarting...', `Restart Cause: ${args.join(' ')}`, restartApp)
    } else {
        msg.reply('You are not an admin.')
        log.info('Non-admin tried to restart bot.')
    }
}

var dbDump = function (msg) {
    if (!config.options.hasDbDump) return

    let data = {}
    data.Items = randomItems.getAllItems()
    data.People = randomItems.getAllPeople()
    data.FactTemplates = randomItems.getAllFacts()
    data.Places = randomItems.getPlaces()
    data.DSF_Adverbs = dsfTerms.getAdverbs()
    data.DSF_Adjectives = dsfTerms.getAdjectives()
    data.DSF_Nouns = dsfTerms.getNouns()

    let builder = []
    Object.keys(data).forEach(key => {
        builder.push(`\n${key}:\n`)
        data[key].forEach(item => {
            builder.push(`> ${JSON.stringify(item)}\n`)
        })
    })
    let out = []
    while (builder.length > 0) {
        if (out.join('').concat(builder[0]).length >= 2000) {
            msg.channel.send(out.join(''))
            out = []
        }
        out.push(builder.shift())
    }
    msg.channel.send(out.join(''))
    msg.channel.send('Done!')
}

var postGibberish = function (msg) {
    if (!config.options.hasGibberish) return
    sendOrReply(msg, getGibberish())
}

// Update/Set all slash commands in cached guilds
var registerSlashCommands = function (client) {
    if (client === undefined || commandArray.data || !config.options.hasSlashCommands) return

    const commands = []
    client.commands = new Discord.Collection()
    commandArray.forEach(cmd => {
        cmd.data = new Discord.SlashCommandBuilder()
            .setName(cmd.phrase)
            .setDescription(cmd.helpMsg || cmd.altMsg)
        if (cmd.hasArgs) {
            cmd.data.addStringOption(option =>
                option.setName('args')
                    .setDescription('Arguments for command.')
                    .setRequired(true))
        }
        cmd.execute = interaction => {
            let args = undefined
            if (cmd.hasArgs) {
                args = `${interaction.options.getString('args', true)}`
            }
            interaction.content = `${prefix}${cmd.phrase} ${args || ''}`
            require('./messages').handleCommand(interaction, false, true)
        }
        client.commands.set(cmd.phrase, cmd)
        commands.push(cmd.data.toJSON())
    })

    const rest = new Discord.REST().setToken(config.token)

    try {
        log.info(`Refreshing ${commands.length} application slash commands.`)
        rest.put(Discord.Routes.applicationCommands(config.botId), {body: commands})
    } catch (err) {
        log.fatal('Could not deploy slash commands', err)
    }
    log.info('Finished reloading slash commands.')
}

let hasRegisteredSilence = false
var startSilence = function (msg) {
    if (!config.options.hasSilenceFn) return

    if (!hasRegisteredSilence) {
        log.info('Registering silence events...')
        hasRegisteredSilence = true

        let task = () => {
            voice.getKeepAliveIds().forEach(guildId => {
                voice.playMusic(guildId, undefined, true, true)
            })
        }
        scheduler.genericReschedule(task, MIN_SILENCE_SECONDS, MAX_SILENCE_SECONDS)
    }

    // Play silence- easiest thing to start this implementation
    voice.playMusic(msg, 'silence', false, true)
}

var handleSlashCommand = async function (interaction) {
    if (!config.options.hasSlashCommands) return
    const command = interaction.client.commands.get(interaction.commandName)

    if (!command) {
        log.error(`Requested slash command not found: ${command}`, interaction.guild.id)
    }

    try {
        if (commandArray.find(x => x.phrase === interaction.commandName).needsReply) {
            await interaction.reply({content: 'Working...', ephemeral: true})
        }
        await command.execute(interaction)
    } catch (err) {
        log.error('Error executing interaction for slashCommand', err)
        if (interaction.replied || interaction.deferred) {
            log.warn('Potentially did not warn user of this error')
        } else {
            await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true })
        }
    }
}

var commandArray = [
    {phrase: 'help', response: sendHelpMessage, altMsg: 'Send message with available commands.'},
    {phrase: 'fact-check', response: factCheck, track: 'Fact', altMsg: 'Check a potential fact template.', hasArgs: true},
    {phrase: 'restart', response: restart, altMsg: 'Restart the DSF bot. (Only availble to admins)', needsReply: true},
    {phrase: 'bully', response: bullyReact, helpMsg: 'Bully your friends with emojis.', hasArgs: true},
    {phrase: 'daily', response: setupDailyChannel, helpMsg: 'Sets up daily stupid facts in the channel.', needsReply: true},
    {phrase: 'db-dump', response: dbDump, altMsg: 'Shows all database items.'},
    {phrase: 'delete', response: deleteFunction, helpMsg: 'Deletes the last (up to 10) messages in the channel.', hasArgs: true, needsReply: true},
    {phrase: 'dsf', response: msg => sendDsfAcronym(msg, false), helpMsg: 'Gives a DSF acronym.', track: 'Acronym'},
    {phrase: 'dsf-loud', response: msg => sendDsfAcronym(msg, true), helpMsg: 'A DSF acronym, but loud.', track: 'Acronym'},
    {phrase: 'effects', response: sendEffectsList, helpMsg: 'Sends list of available sound effects.'},
    {phrase: 'effects-enabled', response: setSoundEffectsEnabled, helpMsg: 'Enables or disables sound effects on the server.', hasArgs: true, needsReply: true},
    {phrase: 'end-daily', response: deleteDailyChannel, helpMsg: 'Stops sending daily stupid facts to this channel.', needsReply: true},
    {phrase: 'fact', response: false, helpMsg: 'Sends a stupid fact.', track: 'Fact'},
    {phrase: 'gibberish', response: postGibberish, helpMsg: 'Just try it...'},
    {phrase: 'lie', response: true, helpMsg: 'Sends a lie.', track: 'Lie'},
    {phrase: 'loud', response: msg => voice.playMusic(msg, undefined, true, false, true), helpMsg: 'Kind of like silence, but the exact opposite.', needsReply: true},
    {phrase: 'music', response: msg => voice.playMusic(msg, 'music'), helpMsg: 'Plays endless music.', needsReply: true},
    {phrase: 'pause', response: voice.pauseMusic, helpMsg: 'Pauses music, if playing.', needsReply: true},
    {phrase: 'prius', response: postPriusPic, helpMsg: 'No explanation needed.', track: 'Prius'},
    {phrase: 'repick', response: msg => repickEvent(msg.guild, x => sendOrReply(msg, x), msg.member.id), helpMsg: 'Repicks host.'},
    {phrase: 'resume', response: voice.resumeMusic, helpMsg: 'Resumes music, if playing.', needsReply: true},
    {phrase: 'silence', response: startSilence, helpMsg: 'Silence, occasionally broken up by effects.', needsReply: true},
    {phrase: 'stats', response: stats.getStatistics, helpMsg: 'Lists your daily stupid fact statistics.', track: 'Stats'},
    {phrase: 'stop', response: voice.stopMusic, helpMsg: 'Stops music and removes bot from voice channel.', needsReply: true},
    {phrase: 'unsubscribe', response: msg => msg.reply('I politely decline.'), helpMsg: 'Unsubscribes you from this bot.'}
]

module.exports = {
    commands: commandArray,
    sendDsfAcronym,
    registerSlashCommands,
    handleSlashCommand
}
