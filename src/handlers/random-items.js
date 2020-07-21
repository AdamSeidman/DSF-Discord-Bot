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
            randomItems.database.each('SELECT * FROM Items', (err, row) => {
                if (err) {
                    console.log('Error reading in item:\nItem-')
                    console.log(row)
                    console.log(err)
                } else {
                    if (row.isAlive) {
                        animals.push(row)
                    } else {
                        nonLivingItems.push(row)
                    }
                    items.push(row)
                }
            })

            randomItems.database.each('SELECT * FROM People', (err, row) => {
                if (err) {
                    console.log('Error reading in person:\nPerson-')
                    console.log(row)
                    console.log(err)
                } else {
                    if (row.isAlive) {
                        alive.push(row)
                    } else {
                        dead.push(row)
                    }
                    people.push(row)
                }
            })
            /*
            randomItems.database.each('SELECT * FROM Facts', (err, row) => {
                if (err) {
                    console.log('Error reading in fact:\nFact-')
                    console.log(row)
                    console.log(err)
                } else {
                    if (!(row.cantRecurse || false)) {
                        recursiveFacts.push(row)
                    }
                    facts.push(row)
                }
            }) */ // TODO REMOVE!!!!!!!!!!!!!
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