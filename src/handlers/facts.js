var itemHandler = require('./random-items')

const PREP_PREFIX = 'prepare'
const MAX_RAND = 98

module.exports = {
    getRandomFact: function (isLie) {
        if(rand(1500) === 420) {
            return 'Hitler did nothing wrong.'
        } else if (rand(900) === 60) {
            return 'Fact machine broken.'
        }
        let resFact = constructFact(randItemFromArray(itemHandler.getAllFacts()), isLie) + '.'
        if (resFact.length <= 2) {
            return 'Fact machine actually broke.'
        }
        return (resFact.slice(0, 1).toUpperCase() + resFact.slice(1))
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
        item = randItemFromArray(item)
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
    fact: (isLie) => constructFact(randItemFromArray(itemHandler.getRecursiveFacts()), isLie),
    number: () => rand(MAX_RAND),
    math: () => {
        let a = rand(MAX_RAND)
        let b = rand(MAX_RAND)
        let c = rand(MAX_RAND)
        while (c === (a+b) || c === (a-b) || c === (a*b)) {
            if (c < MAX_RAND / 3) {
                --c
            } else if (c > MAX_RAND / 3) {
                ++c
            } else {
                c = rand(MAX_RAND)
            }
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
            result += randItemFromArray(item)
        } else {
            result += item
        }
    })
    return result
}
var randItemFromArray = function (arr) {
    if (arr === undefined || arr.length <= 1) {
        return undefined
    }
    return arr[Math.floor(Math.random() * arr.length)]
}
var rand = function (max) {
    if (max === undefined) {
        max = MAX_RAND
    }
    return Math.ceil(Math.random() * max) + 1
}
var numQueue = []