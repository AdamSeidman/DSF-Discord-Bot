const facts = require('./facts')
const commands = require('./commands').commands
const prefix = require('./commands').prefix
const getAdjectives = require('../db/handlers/random-items').getAdjectives
const utils = require('./utils')

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
    
        if (message.slice(0,prefix.length) === prefix.toLowerCase()) {
            if (isDM) {
                msg.reply('Sorry, commands only work in standard text channels.')
            } else {
                message = message.slice(prefix.length).trim()
                handleDictionaryFunction(msg, commands, message.split(' '), message.split(' '))
            }
        } else {
            message = utils.stripPunctuation(message)
            if (handleDictionaryFunction(msg, knownPhrases, message)) {
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
    {phrase: 'fact please', response: msg => sendMsg(msg)},
    {phrase: 'loud fact please', response: msg => sendMsg(msg, true)},
    {phrase: 'lie please', response: msg => sendMsg(msg, false, true)},
    {phrase: 'loud lie please', response: msg => {sendMsg(msg, true, true)}}
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

var handleDictionaryFunction = function (msg, dictionary, searchTerm, args) {
    let foundTerm = false
    if (dictionary !== undefined && searchTerm !== undefined) {
        if (!(searchTerm instanceof Array)) {
            searchTerm = [searchTerm]
        }
        searchTerm.forEach(item => {
            let tempDict = dictionary.find(term => term.phrase === item)
            if (tempDict !== undefined) {
                if (typeof(tempDict.response) === 'boolean') {
                    msg.channel.send(facts.getRandomFact(tempDict.response))
                } else {
                    tempDict.response(msg, args)
                }
                foundTerm = true
                return
            }
        })
    }
    return foundTerm
}