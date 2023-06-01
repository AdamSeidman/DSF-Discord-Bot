/**
 * Author: Adam Seidman
 * 
 * Reads in all random-items from db
 * Provides a lot of specific getter functions
 * 
 * Exports:
 *    Items-
 *        getAllItems, getAnimals, getItems, addItem
 *    People-
 *        getDeadPeople, getAlivePeople, getAllPeople, addPerson
 *    Facts-
 *        getRecursiveFacts, getAllFacts, addFact
 *        getAdjectives, addAdjective
 *    Places-
 *        getPlaces, addPlace
 *    Static Facts-
 *        getStaticFact, addStaticFact
 *    Other-
 *        getWebFormattedData
 *        refreshItems
 *        setupItems
 */

const db = require('../db')
const { randomArrayItem } = require('../../base/utils')

var lists = { // All possible categories of random items (currently)
    items: [],
    animals: [],
    nonLivingItems: [],
    people: [],
    alive: [],
    dead: [],
    facts: [],
    recursiveFacts: [],
    adjectives: [],
    places: [],
    staticFacts: []
}

// Get any array of items given category
var getArray = function (arr) {
    return lists[arr] || []
}

// Add a place to db with provided information
var addPlace = function (place) {
    let randomItems = db.getDatabase('randomItems')
    randomItems.insert('Places', {
        name: place
    }, () => {
        console.log(`'${place}' added to database.`)
        refresh()
    })
    randomItems.close()
}

// Add a person given to db with provided information
var addPerson = function (name, isMale, isAlive) {
    let randomItems = db.getDatabase('randomItems')
    randomItems.insert('People', {
        name: name, // Four person categories
        isMale: isMale,
        isAlive: isAlive
    }, () => {
        console.log(`'${name}' added to database.`)
        refresh()
    })
    randomItems.close()
}

// Add an item to db with provided information
var addItem = function (name, plural, isAlive, usage) {
    let randomItems = db.getDatabase('randomItems')
    randomItems.insert('Items', {
        name: name, // Four item categories
        plural: plural,
        isAlive: isAlive,
        usage: usage
    }, () => {
        console.log(`'${name}' added to database.`)
        refresh()
    })
    randomItems.close()
}

// Add an item to db (single string)
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

// Add a fact template to db with string and boolean
var addFact = function(template, canRecurse) {
    template = `[${template.replace(/'/g, '\'\'')}]`.replace('truth', '"truth"').replace('lie', '"lie"') // Add quotes where needed
    try {
        JSON.parse(template)
    } catch (err) {
        console.error('Provided fact template was invalid.')
        console.error(err)
        return
    }

    let randomItems = db.getDatabase('randomItems')
    randomItems.insert('Facts', {
        canRecurse: canRecurse,
        fact: template
    }, () => {
        console.log('New fact was added to database.')
        refresh()
    })
    randomItems.close()
}

// Add a static fact to db with provided fact string
var addStaticFact = function(fact) {
    let randomItems = db.getDatabase('randomItems')
    randomItems.insert('StaticFacts', {
        sentence: fact
    }, () => {
        console.log('New static fact was added to database.')
        refresh()
    })
    randomItems.close()
}

var getStaticFact = function () {
    let randomItems = db.getDatabase('randomItems')
    let fact = randomArrayItem(getArray('staticFacts')).sentence
    randomItems.database.run('DELETE FROM StaticFacts WHERE sentence LIKE \'(?)\'', [fact.split(/'|;/).join('%')], function (err) {
        if (err) {
            console.log(err)
            console.log('Error occured in delete from static facts db.')
        } else {
            console.log(`Sending static fact: ${fact}`)
        }
    })
    refresh()
    randomItems.close()
    return fact
}

// Setup function for all random items
var setup = function () {
    if (lists.items.length === 0) {
        db.setUpDatabases() // Get db
        let randomItems = db.getDatabase('randomItems')
        if (!randomItems) {
            // blank
            console.log('Error: No random items.')
            console.log(randomItems)
        } else {
            // Store random items/people/etc. into all possible categories
            randomItems.forEach('Items', row => { // Load Items
                if (row.isAlive) {
                    lists.animals.push(row)
                } else {
                    lists.nonLivingItems.push(row)
                }
                lists.items.push(row)
            })

            randomItems.forEach('Places', row => { // Load Places
                lists.places.push(row)
            })

            randomItems.forEach('StaticFacts', row => { // Load Static Facts
                lists.staticFacts.push(row)
            })

            randomItems.forEach('People', row => { // Load People
                if (row.isAlive) {
                    lists.alive.push(row)
                } else {
                    lists.dead.push(row)
                }
                lists.people.push(row)
            })
            
            randomItems.forEach('Facts', row => { // Load Facts
                row.fact = JSON.parse(row.fact)
                if (row.canRecurse) {
                    lists.recursiveFacts.push(row)
                }
                lists.facts.push(row)
            })

            randomItems.forEach('Adjectives', row => { // Load Adjectives
                lists.adjectives.push(row.term.toLowerCase())
            })

            console.log('Random Items Setup Complete.')
            randomItems.close()
        }
    }
}

// Refresh with new database items
var refresh = function () {
    console.log('Item Refresh Requested.')
    // Clear everything and run setup() again
    lists = {
        items: [],
        animals: [],
        nonLivingItems: [],
        people: [],
        alive: [],
        dead: [],
        facts: [],
        recursiveFacts: [],
        adjectives: [],
        places: [],
        staticFacts: []
    }
    setup()
}

// Provide items in object (map)
// Used for nice formatting for http
var formattedData = function () {
    let data = {}
    data.people = lists.people.map(x => x.name.toLowerCase().trim())
    data.items = lists.items.map(x => x.name.toLowerCase().trim())
    data.items = [...data.items, ...lists.places.map(x => x.name.toLowerCase().trim())]
    return data
}

module.exports = {
    getAllItems: () => getArray('items'),
    getAnimals: () => getArray('animals'),
    getItems: () => getArray('nonLivingItems'),
    getAllPeople: () => getArray('people'),
    getAlivePeople: () => getArray('alive'),
    getDeadPeople: () => getArray('dead'),
    getAllFacts: () => getArray('facts'),
    getPlaces: () => getArray('places'),
    getRecursiveFacts: () => getArray('recursiveFacts'),
    getAdjectives: () => getArray('adjectives'),
    getStaticFact: getStaticFact,
    hasStaticFacts: () => getArray('places').length > 0,
    setupItems: setup,
    refreshItems: refresh,
    addPerson: addPerson,
    addItem: addItem,
    addAdjective: addAdjective,
    addFact: addFact,
    addPlace: addPlace,
    addStaticFact: addStaticFact,
    getWebFormattedData: formattedData
}