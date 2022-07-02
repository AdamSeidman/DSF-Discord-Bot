const facts = require('./facts')
const { commands, prefix, sendDsfAcronym } = require('./commands')
const { getAdjectives } = require('../db/handlers/random-items')
const utils = require('./utils')
const { playMusic } = require('./voice')
const { postPriusPic } = require('./prius')

var dictionaryTerms = undefined

module.exports = {
    handle: function (msg, isDM) {
        if (dictionaryTerms === undefined) {
            dictionaryTerms = getAdjectives()
        }

        let message = msg.content.toLowerCase().trim()
        if (message.length <= 3) {
            return
        }

        if (['thanks', 'thank you', 'thank'].includes(utils.stripPunctuation(message))) {
            msg.reply('No Problem.')
        } else if (message.slice(0,prefix.length) === prefix.toLowerCase()) {
            if (isDM) {
                msg.reply('Sorry, commands only work in standard text channels.')
            } else {
                message = message.slice(prefix.length).trim()
                handleDictionaryFunction(msg, commands, message.split(' '), true)
            }
        } else {
            message = utils.stripPunctuation(message)
            if (handleDictionaryFunction(msg, knownPhrases, message.split(' ').join(''))) {
                return
            } else if ((message = hasDictionaryTerm(message.split(' '))) !== '') {
                handleDictionaryTerm(msg, message)
            }
        }
    }
}

var sendMsg = function (msg, loud, lie) {
    if (loud) {
        msg.channel.send(facts.getRandomFact(lie), {tts: true})
    } else {
        msg.reply(facts.getRandomFact(lie))
    }
}

const knownPhrases = [
    {phrase: 'loudfactplease', response: msg => sendMsg(msg, true)},
    {phrase: 'factplease', response: msg => sendMsg(msg)},
    {phrase: 'loudlieplease', response: msg => sendMsg(msg, true, true)},
    {phrase: 'lieplease', response: msg => sendMsg(msg, false, true)},
    {phrase: 'fitnessgrampacertest', response: msg => playMusic(msg, 'pacer')},
    {phrase: 'boom', response: msg => playMusic(msg, 'boom')},
    {phrase: 'bonk', response: msg => playMusic(msg, 'bonk')},
    {phrase: 'omg', response: msg => playMusic(msg, 'omg')},
    {phrase: 'priusplease', response: postPriusPic},
    {phrase: 'loudacronymplease', response: msg => sendDsfAcronym(msg, true, false)},
    {phrase: 'acronymplease', response: msg => sendDsfAcronym(msg, false, true)}
]

var hasDictionaryTerm = function (arr) {
    if (arr !== undefined && arr instanceof Array) {
        arr = arr.filter(item => dictionaryTerms.includes(item))
        if (arr.length > 0) {
            return arr[0]
        }
    }
    return ''
}

var handleDictionaryTerm = function (msg, message) {
    msg.channel.send(`Did someone say ${message}?`)
    msg.channel.send('This calls for a fact!')
    msg.channel.send('Ready? Here it is:')
    msg.channel.send(facts.getRandomFact())
}

var handleDictionaryFunction = function (msg, dictionary, searchTerm, isCommand) {
    let foundTerm = false
    if (dictionary !== undefined && searchTerm !== undefined) {
        if (!(searchTerm instanceof Array)) {
            searchTerm = [searchTerm]
        }
        searchTerm.forEach(item => {
            let tempDict = undefined
            if (isCommand) tempDict = dictionary.find(term => term.phrase === item)
            else tempDict = dictionary.find(term => item.indexOf(term.phrase) >= 0)
            
            if (tempDict !== undefined) {
                if (typeof(tempDict.response) === 'boolean') {
                    msg.channel.send(facts.getRandomFact(tempDict.response))
                } else {
                    tempDict.response(msg, searchTerm)
                }
                foundTerm = true
                return
            }
        })
    }
    return foundTerm
}