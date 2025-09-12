const voice = require("./voice")
const tzlookup = require('tz-lookup')
const Discord = require("discord.js")
const commands = require("./commands")
const stats = require("@tables/stats")
const fact = require("../commands/fact")
const cities = require('all-the-cities')
const effects = require("@media/effects")
const phrases = require("@tables/phrases")
const logger = require("@adamseidman/logger")
const adjectives = require("@tables/adjectives")
const construction = require("@facts/construction")
const effectsGuilds = require("@tables/effectsGuilds")
const { stripPunctuation, removeSpaces, toParts, probabilityCheck, 
    matchesDiscordId, randomArrayItem, cleanUpSpaces} = require("logic-kit")

const pleaseMap = {
    fact: 'fact',
    lie: 'lie',
    prius: 'prius',
    acronym: 'dsf',
    gibberish: 'gibberish'
}
Object.freeze(pleaseMap)

function handlePlease(msg) {
    let parts = removeSpaces(stripPunctuation(msg.content)).toLowerCase().split('please')
    parts.pop()
    if (parts.length < 1) return
    const [_, pleaseFn] = Object.entries(pleaseMap).find(([key]) => parts.find(x => x.endsWith(key))) || []
    if (typeof pleaseFn === 'string') {
        msg.commandName = pleaseFn
        msg.userParams = {
            injected: true,
            isPlease: true,
            isDM: msg.channel.type === Discord.ChannelType.DM,
            isTestingGuild: msg.guild?.id == process.env.DISCORD_TESTING_GUILD_ID,
            params: []
        }
        commands.handleSlashCommand(msg)
            .catch(logger.error)
    }
}

function getFindRequestPhrase(message) {
    message = toParts(message.toLowerCase())
    const result = {
        hasPhrase: false,
        isMe: true,
        user: '',
        isFact: null,
        factPhrase: message[3],
        subject: ''
    }
    if (message.length < 6) {
        return result
    }
    if (message[0] !== 'give' && message[0] !== 'tell') {
        return result
    }
    const userId = matchesDiscordId(message[1])
    if (userId) {
        result.user = Discord.userMention(userId) + '\n',
        result.isMe = false
    } else if (message[1] !== 'me') {
        return result
    }
    if (message[2] !== 'a' || message[4] !== 'about') {
        return result
    }
    if (message[3] === 'fact' || message[3] === 'lie') {
        result.isFact = (message[3] === 'fact')
        result.hasPhrase = true
    }
    result.subject = message.slice(5).join(' ')
    return result
}

function handlePhrase(msg) {
    const input = stripPunctuation(msg.content.toLowerCase())
    const phrase = phrases.getPhrase(removeSpaces(input))
    const adjective = adjectives.getAll().find(x => toParts(input).includes(x))
    const findResult = getFindRequestPhrase(input)

    if (findResult.hasPhrase) {
        const result = construction.findSpecificTemplate(findResult.subject, findResult.isFact)
        if (result.found) {
            if (findResult.isMe) {
                return msg.reply(result.fact)
            } else {
                return msg.channel.send(`${findResult.user}${result.fact}`)
            }
        } else {
            return msg.channel.send(`${findResult.user}I could not find a ${findResult.factPhrase} for "${
                findResult.subject}" in my database.\nHere's a ${findResult.factPhrase} about ${
                result.alternateSubject} instead:\n${result.fact}`)
        }
    } else if (phrase) {
        if (phrase.is_reply) {
            return msg.reply(phrase.response)
        } else {
            return msg.channel.send(phrase.response)
        }
    } else if (adjective) {
        msg.reply = (content) => {
            return msg.channel.send(`Did someone say ${
                adjective}?\nThis calls for a fact!\nReady? Here it is:\n${
                content}`)
        }
        fact.response(msg, { injected: false, user: msg.member })
    }
}

function getTimeRequest(message) {
    message = toParts(message.toLowerCase())
    const result = {
        hasPhrase: false,
        hasSpecific: false,
        showPopulation: false
    }
    if (!message.includes('population')) {
        result.showPopulation = probabilityCheck()
    }
    while (message.includes('what')) {
        message = message.slice(message.indexOf('what') + 1)
        if (message.length < 3) {
            return result
        }
        if (message[0] === 'time' || message[1] === 'is' || message[2] === 'it') {
            result.hasPhrase = true
            break;
        }
    }
    if (!result.hasPhrase || message.length < 3) {
        return result
    }
    message = message.slice(3)
    if (message.length >= 2 && message[0] == 'in' && message[1].trim().length > 1) {
        result.hasSpecific = true
    }
    return result
}

const regionNames = new Intl.DisplayNames([global.dsf.languageCode], { type: 'region' })
Object.freeze(regionNames)

function getCountryName(countryCode) {
    try {
        return regionNames.of(countryCode)
    } catch {
        logger.warn(`Could not get country code of "${countryCode}" in ${global.dsf.languageCode}`)
    }
    return countryCode
}

function handleTimeRequest(msg) {
    const request = getTimeRequest(stripPunctuation(msg.content).trim())
    if (!request.hasPhrase) return
    const randomCity = randomArrayItem(cities)
    const [lng, lat] = randomCity.loc.coordinates
    const { name, country, population } = randomCity
    const formatter = new Intl.DateTimeFormat(global.dsf.languageCode, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: tzlookup(lat, lng)
    })
    let message = `It is currently ${formatter.format(new Date())} in ${name}, ${getCountryName(country)}.`
    if (request.hasSpecific) {
        message += ' You do the math.'
    } else if (request.showPopulation) {
        message += Discord.italic(` (population of ${population})`)
    }
    return msg.reply(message)
}

function handlePopulationRequest(msg) {
    let input = cleanUpSpaces(stripPunctuation(msg.content).toLowerCase()).replace('whats', 'what is')
    const phrase = 'what is the population of '
    if (!input.includes(phrase)) return
    input = input.slice(input.indexOf(phrase) + phrase.length).trim()
    if (input.length < 1) return
    input = toParts(input)
    if (input[0]?.length < 1) return
    let randomCity = {}
    let timeout = 0
    do {
        randomCity = randomArrayItem(cities)
    } while ((typeof randomCity.population !== 'number' || 
        input.join(' ').includes(stripPunctuation(randomCity.name).toLowerCase())) && timeout++ < 100)
    return msg.reply(`The population of ${randomCity.name}, ${getCountryName(randomCity.country)
        } is ${randomCity.population}. You do the math.`)
}

function handleSoundEffect(msg) {
    if (msg.member === null || !effectsGuilds.hasGuild(msg.guild.id)) return
    const message = removeSpaces(stripPunctuation(msg.content.toLowerCase()))
    const effect = effects.getList().find(x => message.includes(x))
    if (effect) {
        if (voice.playEffect(msg, effect)) {
            stats.updateStat(msg.member, 'effect')
        }
    }
}

module.exports = {
    messageHandlers: [
        handlePlease,
        handlePhrase,
        handleTimeRequest,
        handlePopulationRequest,
        handleSoundEffect
    ]
}
