const db = require('../db/db')

var lists = {
    items: [],
    animals: [],
    nonLivingItems: [],
    people: [],
    alive: [],
    dead: [],
    facts: [],
    recursiveFacts: []
}

var getArray = function (arr) {
    return lists[arr] || []
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
            /*
            randomItems.forEach('Facts', row => {
                if (!(row.cantRecurse || false)) {
                    lists.recursiveFacts.push(row)
                }
                lists.facts.push(row)
            }) */ // TODO REMOVE!!!!!!!!!!!!!

            console.log('Random Items Setup Complete!')
            randomItems.close()
        }
    }
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
    setupItems: setup
}