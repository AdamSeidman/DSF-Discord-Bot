var items = require('./random-items')
const facts = require('./fact-templates').facts

module.exports = {
    getRandomFact: function (isLie) {
        if(rand(1500) === 420) {
            return 'Hitler did nothing wrong.'
        } else if (rand(900) === 60) {
            return 'Fact machine broken.'
        }
        let resFact = constructFact(randItemFromArray(facts), isLie) + '.'
        if (resFact.length <= 2) {
            return 'Fact machine actually broke.'
        }
        return (resFact.slice(0, 1).toUpperCase() + resFact.slice(1))
    }
}

const MAX_RAND = 98
var index = {
    blank: items.blank,
    person: items.person,
    fact: (isLie) => constructFact(randItemFromArray(facts, true), isLie),
    blanks: () => pluralize(randItemFromArray(index.blank)),
    number: () => rand(MAX_RAND),
    prepareMath: () => {
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
        } else if (item instanceof Array && item.length <= 1) {
            item = index[item[0]]
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
var randItemFromArray = function (arr, look) {
    if (arr === undefined || arr.length <= 1) {
        return undefined
    }
    let result = undefined
    while (result === undefined) {
        result = arr[Math.floor(Math.random() * arr.length)]
        if (look !== undefined && result.cantRecurse) {
            result = undefined
        }
    }
    return result
}
var pluralize = function (str) {
    if (str === undefined || str.length === 0) {
        return ''
    }
    switch(str.slice(-1)) {
    case 'x':
    case 's':
    case 'h':
        return str + 'es'
    case 'y':
        return str.slice(0, str.length - 1) + 'ies'
    }
    return str + 's'
}
var rand = function (max) {
    if (max === undefined) {
        max = MAX_RAND
    }
    return Math.ceil(Math.random() * max) + 1
}
var numQueue = []