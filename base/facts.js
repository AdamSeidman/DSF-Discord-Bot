const itemHandler = require('../db/handlers/random-items')
const utils = require('./utils')
var { shouldGenerateFact, overrideMessage } = require('../web/override')

const PREP_PREFIX = 'prepare'

module.exports = {
    getRandomFact: function (isLie) {
        if (shouldGenerateFact()) {
            let resFact = constructFact(utils.randomArrayItem(itemHandler.getAllFacts()), isLie) + '.'
            if (resFact.length <= 2) {
                return 'Fact machine broken.'
            }
            return (resFact.slice(0, 1).toUpperCase() + resFact.slice(1))

        } else {
            return overrideMessage()
        }
    }
}

var lastItem = {
    item: undefined,
    hasBeenCalled: true
}
var lastPerson = {
    person: undefined,
    hasBeenCalled: true
}

var prepareTerm = function(isEmpty, isPlural, isPerson, isAlive) {
    let item = undefined
    if (isPerson) {
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
    } else {
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
        item = utils.randomArrayItem(item)
    }
    if (isPerson) {
        lastPerson.person = item
    } else {
        lastItem.item = item
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
    usage: () => {
        if (lastItem === undefined) return ''
        else return lastItem.item.usage
    },
    nickname: () => {
        if (lastPerson === undefined) return ''
        else return lastPerson.person.nickname
    },
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
    getFromQueue: () => (numQueue.pop()).toString(),
    he: () => getPronoun('he'),
    him: () => getPronoun('him'),
    his: () => getPronoun('his')
}

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