const db = require('../db')

var lists = {
    items: [],
    animals: [],
    nonLivingItems: [],
    people: [],
    alive: [],
    dead: [],
    facts: [],
    recursiveFacts: [],
    adjectives: []
}

var getArray = function (arr) {
    return lists[arr] || []
}

var addPerson = function (name, nickname, isMale, isAlive) {
    let randomItems = db.getDatabase('randomItems')
    randomItems.insert('People', {
        name: name,
        nickname: nickname,
        isMale: isMale,
        isAlive: isAlive
    }, () => {
        console.log(`'${name}' added to database.`)
        refresh()
    })
    randomItems.close()
}

var addItem = function (name, plural, isAlive, usage) {
    let randomItems = db.getDatabase('randomItems')
    randomItems.insert('Items', {
        name: name,
        plural: plural,
        isAlive: isAlive,
        usage: usage
    }, () => {
        console.log(`'${name}' added to database.`)
        refresh()
    })
    randomItems.close()
}

var addAdjective = function(adjective) {
    let randomItems = db.getDatabase('randomItems')
    randomItems.insert('Adjectives', {
        term: adjective
    }, () => {
        console.log(`'${adjective}' added to database.`)
        refresh()
    })
    randomItems.close()
}

var addFact = function(fact, canRecurse) {
    let randomItems = db.getDatabase('randomItems')
    randomItems.insert('Facts', {
        canRecurse: canRecurse,
        fact: `[${fact.replace(/'/g, '\'\'')}]`
            .replace('truth', '"truth"').replace('lie', '"lie"')
    }, () => {
        console.log('New fact was added to database.')
        refresh()
    })
    randomItems.close()
}

var setup = function () {
    if (lists.items.length === 0) {
        db.setUpDatabases()
        let randomItems = db.getDatabase('randomItems')
        if (!randomItems) {
            console.log('Error: No random items.')
            console.log(randomItems)
        } else {
            randomItems.forEach('Items', row => {
                if (row.isAlive) {
                    lists.animals.push(row)
                } else {
                    lists.nonLivingItems.push(row)
                }
                lists.items.push(row)
            })

            randomItems.forEach('People', row => {
                if (row.isAlive) {
                    lists.alive.push(row)
                } else {
                    lists.dead.push(row)
                }
                lists.people.push(row)
            })
            
            randomItems.forEach('Facts', row => {
                row.fact = JSON.parse(row.fact)
                if (row.canRecurse) {
                    lists.recursiveFacts.push(row)
                }
                lists.facts.push(row)
            })

            randomItems.forEach('Adjectives', row => {
                lists.adjectives.push(row.term.toLowerCase())
            })

            console.log('Random Items Setup Complete!')
            randomItems.close()
        }
    }
}

var refresh = function () {
    console.log('Item Refresh Requested.')
    lists = {
        items: [],
        animals: [],
        nonLivingItems: [],
        people: [],
        alive: [],
        dead: [],
        facts: [],
        recursiveFacts: [],
        adjectives: []
    }
    setup()
}

module.exports = {
    getAllItems: () => getArray('items'),
    getAnimals: () => getArray('animals'),
    getItems: () => getArray('nonLivingItems'),
    getAllPeople: () => getArray('people'),
    getAlivePeople: () => getArray('alive'),
    getDeadPeople: () => getArray('dead'),
    getAllFacts: () => getArray('facts'),
    getRecursiveFacts: () => getArray('recursiveFacts'),
    getAdjectives: () => getArray('adjectives'),
    setupItems: setup,
    refreshItems: refresh,
    addPerson: addPerson,
    addItem: addItem,
    addAdjective: addAdjective,
    addFact: addFact
}