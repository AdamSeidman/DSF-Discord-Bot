const itemHandler = require('../db/handlers/random-items')
const utils = require('./utils')
var { shouldGenerateFact, overrideMessage } = require('../gui/override')

const PREP_PREFIX = 'prepare'

module.exports = {
    getRandomFact: function (isLie) {
        if (shouldGenerateFact()) {
            return utils.getRandomString(() => {
                let resFact = constructFact(utils.randomArrayItem(itemHandler.getAllFacts()), isLie) + '.'
                if (resFact.length <= 2) {
                    return 'Fact machine actually broke.'
                }
                return (resFact.slice(0, 1).toUpperCase() + resFact.slice(1))
            })
        } else {
            return overrideMessage()
        }
    }
}

var lastItem = undefined
var lastPerson = undefined

var personPrepared = false
var itemPrepared = false

var prepareTerm = function(isEmpty, isPlural, isPerson, isAlive) {
    let item = undefined
    if (isPerson) {
        if (personPrepared) {
            item = lastPerson
        } else if (isAlive === undefined) {
            item = itemHandler.getAllPeople()
        } else if (isAlive) {
            item = itemHandler.getAlivePeople()
        } else {
            item = itemHandler.getDeadPeople()
        }
    } else {
        if (itemPrepared) {
            item = lastItem
        } else if (isAlive === undefined) {
            item = itemHandler.getAllItems()
        } else if (isAlive) {
            item = itemHandler.getAnimals()
        } else {
            item = itemHandler.getItems()
        }
    }

    if (item instanceof Array) {
        item = utils.randomArrayItem(item)
    }
    if (isPerson) {
        lastPerson = item
    } else {
        lastItem = item
    }

    if (isPlural) {
        item = item.plural
    } else {
        item = item.name
    }
    if (isEmpty) {
        return ''
    }
    return item
}

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
    fact: (isLie) => constructFact(utils.randomArrayItem(itemHandler.getRecursiveFacts()), isLie),
    number: () => utils.randomNumber(),
    math: () => {
        let a = utils.randomNumber()
        let b = utils.randomNumber()
        let c = utils.randomNumber()
        while (c === (a+b) || c === (a-b) || c === (a*b)) {
            c = utils.randomNumber()
        }
        numQueue.push(c)
        numQueue.push(b)
        numQueue.push(a)
        return ''
    },
    getFromQueue: () => (numQueue.pop()).toString()
}
var constructFact = function (fact, isLie) {
    if (fact === undefined || fact.fact === undefined) {
        return undefined
    }
    let result = ''
    fact.fact.forEach(item => {
        if (item.lie !== undefined) {
            if (isLie) {
                item = item.lie
            } else {
                item = item.truth
            }
        }
        if (item instanceof Array && item.length === 1) {
            const isPrep = item[0].slice(0, PREP_PREFIX.length) === PREP_PREFIX
            if (isPrep) {
                item[0] = item[0].slice(PREP_PREFIX.length).toLowerCase()
            }
            item = index[item[0]](isLie, isPrep)
        }
        if (item instanceof Function) {
            result += item(isLie)
        } else if (item instanceof Array) {
            result += utils.randomArrayItem(item)
        } else {
            result += item
        }
    })
    return result
}

var numQueue = []