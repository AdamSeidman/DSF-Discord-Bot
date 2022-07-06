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
const utils = require('./utils')
var { shouldGenerateFact, overrideMessage } = require('../web/override')

const PREP_PREFIX = 'prepare' // Term prefix in fact template for pronouns and articles

module.exports = {
    getRandomFact: function (isLie) {
        if (shouldGenerateFact()) {
            // Override is not in effect
            let fact = undefined
            do {
                fact = utils.randomArrayItem(itemHandler.getAllFacts())
                if (fact.probability === undefined || fact.probability <= 0.0 || fact.probability > 1.0) {
                    fact.probability = 1.0
                }
            } while (!utils.probabilityCheck(fact.probability))
            let resFact = constructFact(fact, isLie) + '.' // Call constructFact with first pass (can be recursive)
            if (resFact.length <= 2) {
                // Shouldn't happen- but is funny
                return 'Fact machine broken.'
            }
            return (resFact.slice(0, 1).toUpperCase() + resFact.slice(1)) // Capitalize first letter and return

        } else {
            // If web UI says to override message, send that message.
            return overrideMessage()
        }
    }
}

// These two objects are used to prepare random items and people in order to get their articles/pronouns
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
var prepareTerm = function(isEmpty, isPlural, isPerson, isAlive) {
    let item = undefined
    if (isPerson) { // People
        if (!(isEmpty || lastPerson.hasBeenCalled)) {
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
        if (!isEmpty && !lastItem.hasBeenCalled) {
            item = lastItem.item
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
    fact: (isLie) => {
        let fact = undefined
        do {
            fact = utils.randomArrayItem(itemHandler.getRecursiveFacts())
            if (fact.probability === undefined || fact.probability <= 0.0 || fact.probability > 1.0) {
                fact.probability = 1.0
            }
        } while (utils.probabilityCheck(fact.probability))
        return constructFact(fact, isLie)
    },
    number: () => utils.randomNumber(),
    usage: () => {
        if (lastItem === undefined) return ''
        else return lastItem.item.usage
    },
    nickname: () => {
        if (lastPerson === undefined) return ''
        else return lastPerson.person.nickname
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
    getFromQueue: () => (numQueue.pop()).toString(),
    he: () => getPronoun('he'),
    him: () => getPronoun('him'),
    his: () => getPronoun('his')
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
    } else if (lastPerson.person.isMale) {
        return term
    } else {
        switch (term) {
        case 'he':
            return 'she'
        case 'him':
            return 'her'
        case 'his':
            return 'hers'
        default:
            return ''
        }
    }
}

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
            // Arrays of one word are either items to be parsed or prep notices
            const isPrep = item[0].slice(0, PREP_PREFIX.length) === PREP_PREFIX // ex.: prepItem
            if (isPrep) {
                // Cut off prep- prefix if there is one
                item[0] = item[0].slice(PREP_PREFIX.length).toLowerCase()
            }
            item = index[item[0]](isLie, isPrep) // Grab correct method from function index
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