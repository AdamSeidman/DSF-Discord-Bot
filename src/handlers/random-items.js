const db = require('../db/db')

var items = []
var animals = []
var nonLivingItems = []
var people = []
var alive = []
var dead = []
var facts = []
var recursiveFacts = []

var getArray = function (arr) {
    setup()
    return arr || []
}

var setup = function () {
    if (items.length === 0) {
        db.setUpDatabases()
        let randomItems = db.getDatabase('randomItems')
        if (!randomItems) {
            console.log('Error: No random items.')
            console.log(randomItems)
        } else {
            randomItems.forEach('Items', row => {
                if (row.isAlive) {
                    animals.push(row)
                } else {
                    nonLivingItems.push(row)
                }
                items.push(row)
            })

            randomItems.forEach('People', row => {
                if (row.isAlive) {
                    alive.push(row)
                } else {
                    dead.push(row)
                }
                people.push(row)
            })
            /*
            randomItems.forEach('Facts', row => {
                if (!(row.cantRecurse || false)) {
                    recursiveFacts.push(row)
                }
                facts.push(row)
            }) */ // TODO REMOVE!!!!!!!!!!!!!

            randomItems.close()
        }
    }
}

module.exports = {
    getAllItems: () => getArray(items),
    getAnimals: () => getArray(animals),
    getItems: () => getArray(nonLivingItems),
    getAllPeople: () => getArray(people),
    getAlivePeople: () => getArray(alive),
    getDeadPeople: () => getArray(dead),
    getAllFacts: () => getArray(facts),
    getRecursiveFacts: () => getArray(recursiveFacts)
}