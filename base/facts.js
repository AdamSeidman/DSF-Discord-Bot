/**
 * Author: Adam Seidman
 * 
 * Random Fact Generator
 * 
 * Exports:
 *     getRandomFact: Returns random fact (String)
 *         -Param: (Boolean) isLie
 */

const itemHandler = require('../db/handlers/random-items')
const utils = require('poop-sock')
var { shouldGenerateFact, overrideMessage, setBotOnline } = require('../web/override')
const config = require('../client/config')

const PREP_PREFIX = config.constants.factPrepPrefix // Term prefix in fact template for pronouns and articles
const USE_PREFIX = config.constants.factUsePrefix || 'use' // For usage macros

var getGibberish = function () {
    if (!config.options.hasGibberish) return ''
    let factArr = []
    for (let i = 0; i < 5; i++) {
        factArr.push(constructFact({'fact': [['fact']]}, true))
    }
    factArr = factArr.join(' ').split(' ')
    let sentence = []
    for (let i = 0; i < utils.randomNumber(10) + 3; i++) {
        sentence.push(utils.randomArrayItem(factArr))
    }
    return sentence.join(' ')
}

module.exports = {
    getRandomFact: function (isLie, isDaily) {
        if (shouldGenerateFact()) {
            // Override is not in effect
            if (config.options.usesStaticFacts && isDaily && itemHandler.hasStaticFacts() && utils.probabilityCheck(config.probabilities.staticFacts)) {
                let fact = itemHandler.getStaticFact()
                if (fact !== undefined) {
                    return fact
                }
            }
            let fact = utils.randomArrayItem(itemHandler.getAllFacts())
            let resFact = constructFact(fact, isLie) // Call constructFact with first pass (can be recursive)
            if (!utils.isStringTerminated(resFact)) resFact += '.'
            if (resFact.length <= 2) {
                // Shouldn't happen- but is funny
                return 'Fact machine broken.'
            }
            return (resFact.slice(0, 1).toUpperCase() + resFact.slice(1)) // Capitalize first letter and return

        } else {
            // If web UI says to override message, send that message.
            let fact = (isLie? 'This is a lie: ' : '') + overrideMessage()
            if (isDaily) {
                setBotOnline(false)
            }
            return fact
        }
    },
    constructFact: (fact, isLie) => {
        try {
            fact = constructFact({'fact': fact}, isLie)
            if (!utils.isStringTerminated(fact)) fact += '.'
            fact = fact.slice(0, 1).toUpperCase() + fact.slice(1)
        } catch (err) {
            fact = `[Issue with template] \t${err}`
        }
        return fact
    },
    stuffItem: (item) => {
        if (item.classifier === 'item') {
            lastItem.item = item
            lastItem.hasBeenCalled = false
        } else if (item.classifier === 'person') {
            lastPerson.person = item
            lastPerson.hasBeenCalled = false
        } else if (item.classifier === 'place') {
            lastPlace = item.name
        }
    },
    getGibberish
}

// These two objects are used to prepare random items and people in order to get their articles/pronouns
var lastPlace = undefined

var lastItem = {
    item: undefined,
    hasBeenCalled: true
}
var lastPerson = {
    person: undefined,
    hasBeenCalled: true
}

// Get a random item
// If appropriate, store the object 
var prepareTerm = function(isEmpty, isPlural, isPerson, isAlive, isFood) {
    let item = undefined
    if (isPerson) { // People
        if (!lastPerson.hasBeenCalled) {
            item = lastPerson.person
        } else if (isAlive === undefined) {
            item = itemHandler.getAllPeople()
        } else if (isAlive) {
            item = itemHandler.getAlivePeople()
        } else {
            item = itemHandler.getDeadPeople()
        }
        lastPerson.hasBeenCalled = !isEmpty
    } else { // Items/Animals
        if (!lastItem.hasBeenCalled) {
            item = lastItem.item
        } else if (isFood) {
            item = itemHandler.getFood()
        } else if (isFood === false) {
            item = itemHandler.getNonFood()
        } else if (isAlive === undefined) {
            item = itemHandler.getAllItems()
        } else if (isAlive) {
            item = itemHandler.getAnimals()
        } else {
            item = itemHandler.getItems()
        }
        lastItem.hasBeenCalled = !isEmpty
    }

    if (item instanceof Array) {
        // If item is array, pick random item from array
        item = utils.randomArrayItem(item)
    }
    // Store loggable items
    if (isPerson) {
        lastPerson.person = item
    } else {
        lastItem.item = item
    }

    // Get full name of item
    if (isPlural) {
        item = item.plural
    } else {
        item = item.name
    }
    if (isEmpty) {
        // Not looking for anything yet, just preparing
        return ''
    }
    return item
}

var getPlace = function () {
    if (lastPlace === undefined) {
        return utils.randomArrayItem(itemHandler.getPlaces()).name
    }
    let ret = `${lastPlace}`
    lastPlace = undefined
    return ret
}

// Index is used to process keywords in fact templates
var index = {
    blank: (isLie, prep) => prepareTerm(prep, false, false),
    person: (isLie, prep) => prepareTerm(prep, false, true),
    item: (isLie, prep) => prepareTerm(prep, false, false, false),
    animal: (isLie, prep) => prepareTerm(prep, false, false, true),
    alive: (isLie, prep) => prepareTerm(prep, false, true, true),
    dead: (isLie, prep) => prepareTerm(prep, false, true, false),
    animals: (isLie, prep) => prepareTerm(prep, true, false, true),
    items: (isLie, prep) => prepareTerm(prep, true, false, false),
    blanks: (isLie, prep) => prepareTerm(prep, true, false),
    food: (isLie, prep) => prepareTerm(prep, false, false, false, true),
    foods: (isLie, prep) => prepareTerm(prep, true, false, false, true),
    inedible: (isLie, prep) => prepareTerm(prep, false, false, false, false),
    inedibles: (isLie, prep) => prepareTerm(prep, true, false, false, false),
    noun: (isLie, prep) => index[utils.randomArrayItem(['blank', 'place', 'person'])](isLie, prep),
    place: getPlace,
    fact: (isLie) => {
        let fact = utils.randomArrayItem(itemHandler.getRecursiveFacts())
        return constructFact(fact, isLie)
    },
    gibberish: getGibberish,
    number: () => utils.randomNumber(),
    usage: () => {
        if (lastItem === undefined) return ''
        else return lastItem.item.usage
    },
    math: () => {
        // Random numbers for math facts
        let a = utils.randomNumber()
        let b = utils.randomNumber()
        let c = utils.randomNumber()
        while (c === (a+b) || c === (a-b) || c === (a*b)) {
            // Make sure numbers don't equal anything together
            c = utils.randomNumber()
        }
        // Store in stack
        numQueue.push(c)
        numQueue.push(b)
        numQueue.push(a)
        return ''
    },
    getFromQueue: () => (numQueue.pop()).toString()
}

/*
    Person is logged to lastPerson
    Male pronouns are default (sorry)
    Based on the logged person, the correct version of the provided pronoun is returned.
    If undefined, Return empty string
*/
var getPronoun = function (term) {
    if (lastPerson === undefined) {
        return ''
    }
    
    term = term[0].split('_')
    return lastPerson.person.isMale? term[0] : term[1]
}

let previousItems = ['', '', '']

// Create actual fact given template and param
// Param: isLie (boolean)- True, if not a fact
var constructFact = function (fact, isLie) {
    if (fact === undefined || fact.fact === undefined) {
        // No fact
        return undefined
    }
    fact = utils.copyObject(fact) // Don't modify cached fact templates
    let result = ''
    fact.fact.forEach(item => { // Parse each fact template item in array
        if (item.lie !== undefined) {
            // Item has two different options for facts, pick the correct one
            if (isLie) {
                item = item.lie
            } else {
                item = item.truth
            }
        }
        if (item instanceof Array && item.length === 1) {
            let isFact = false
            if (!isNaN(item[0]) && item > 0 && item <= previousItems.length) {
                // Item wanted is previous item
                item = [previousItems[item[0] - 1]]
            } else if (item[0].slice(0, USE_PREFIX.length) === USE_PREFIX) {
                // Nice macro for: ["useBlank"] => [ ["prepareBlank"], ["usage"], " ", ["blank"] ]
                index[item[0].slice(USE_PREFIX.length).toLowerCase()](isLie, true)
                result += `${index['usage'](isLie, false)} `
                item = index[item[0].slice(USE_PREFIX.length).toLowerCase()](isLie, false)
            } else {
                // Arrays of one word are either items to be parsed or prep notices
                const isPrep = item[0].slice(0, PREP_PREFIX.length) === PREP_PREFIX // ex.: prepItem
                if (isPrep) {
                    // Cut off prep- prefix if there is one
                    item[0] = item[0].slice(PREP_PREFIX.length).toLowerCase()
                }
                if (item[0].includes('_')) {
                    // Better way to prep pronouns- let template enter them
                    item = getPronoun(item)
                } else {
                    isFact = item[0] == 'fact'
                    item = index[item[0]](isLie, isPrep) // Grab correct method from function index
                }
            }
            if (item instanceof Array) {
                item = item[0]
            } else if (item.split !== undefined && !isFact) {
                previousItems.unshift(item)
                previousItems.pop()
            }
        }
        if (item instanceof Function) {
            // Run index function on chosen item
            result += item(isLie)
        } else if (item instanceof Array) {
            // Options of generic text- pick random item
            result += utils.randomArrayItem(item)
        } else {
            // Given text- just add to fact builder string
            result += item
        }
    })
    return result
}

var numQueue = []
