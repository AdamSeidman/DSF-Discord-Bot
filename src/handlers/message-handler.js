const utils = require('../fact_gen/fact-utilities')
const commands = require('./command-handler').commands
const prefix = require('./command-handler').prefix

module.exports = {
    handle: function (msg) {
        let message = msg.content.toLowerCase().trim()
    
        if (message.length <= 3) {
            return
        }
    
        if (message.slice(0,prefix.length) === prefix.toLowerCase()) {
            message = message.slice(prefix.length).trim()
            handleDictionaryFunction(msg, commands, message.split(' '), message.split(' '))
        } else if (handleDictionaryFunction(msg, knownPhrases, message)) {
            return
        } else if ((message = hasDictionaryTerm(message.split(' '))) !== '') {
            handleDictionaryTerm(msg, message)
        }
    }
}

const knownPhrases = [
    {phrase: 'fact please', response:
        function (msg) {
            msg.reply(utils.getRandomFact())
        }
    },
    {phrase: 'loud fact please', response:
        function (msg) {
            msg.channel.send(utils.getRandomFact(), {tts: true})
        }
    }
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

const dictionaryTerms = [
    'ludicrous', 'senseless', 'shortsighted', 'trivial', 'fact', 'dumb', 'unintelligent', 'brainless', 'intelligent', 'deficient', 'dense', 'dim', 'meaningless',
    'mindless', 'moron', 'moronic', 'nonsensical', 'stupid', 'pointless', 'simpleminded', 'slow', 'thick-headed', 'unthinking', 'witless', 'dull', 'foolish', 'ill-advised', 
    'irrelevant', 'relevant', 'laughable', 'unfunny', 'imbecile', 'inane', 'idiotic', 'idiot', 'bruh'
]

var handleDictionaryTerm = function (msg, message) {
    msg.channel.send(`Did someone say ${message}?`)
    msg.channel.send('This calls for a fact!')
    msg.channel.send('Ready? Here it is:')
    msg.channel.send(utils.getRandomFact())
}

var handleDictionaryFunction = function (msg, dictionary, searchTerm, args) {
    let foundTerm = false
    if (dictionary !== undefined && searchTerm !== undefined) {
        if (!(searchTerm instanceof Array)) {
            searchTerm = [searchTerm]
        }
        searchTerm.forEach(item => {
            let tempDict = dictionary.filter(term => term.phrase === item)
            if (tempDict.length > 0) {
                tempDict[0].response(msg, args)
                foundTerm = true
                return
            }
        })
    }
    return foundTerm
}