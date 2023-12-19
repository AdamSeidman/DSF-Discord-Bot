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
const { randomArrayItem, stripPunctuation, copyObject } = require('poop-sock')
const config = require('../../client/config')
const log = require('better-node-file-logger')

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
    staticFacts: [],
    inedibles: [],
    food: []
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
        log.info(`'${place}' added to database.`)
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
        log.info(`'${name}' added to database.`)
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
        log.info(`'${name}' added to database.`)
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
        log.info(`'${adjective}' added to database.`)
        refresh()
    })
    randomItems.close()
}

// Add a fact template to db with string and boolean
var addFact = function(template, canRecurse) {
    try {
        JSON.parse(template)
    } catch (err) {
        log.error('Provided fact template was invalid.', {template: template, error: err})
        return
    }

    let randomItems = db.getDatabase('randomItems')
    randomItems.insert('Facts', {
        canRecurse: canRecurse,
        fact: template
    }, () => {
        log.info('New fact was added to database.')
        refresh()
    })
    randomItems.close()
}

// Add a static fact to db with provided fact string
var addStaticFact = function(fact) {
    if (!config.options.hasStaticFacts) return
    let randomItems = db.getDatabase('randomItems')
    randomItems.insert('StaticFacts', {
        sentence: fact,
        id: `X${Date.now()}`
    }, () => {
        log.info('New static fact was added to database.')
        refresh()
    })
    randomItems.close()
}

var getStaticFact = function () {
    if (!config.options.hasStaticFacts) return ''
    let randomItems = db.getDatabase('randomItems')
    let fact = randomArrayItem(getArray('staticFacts'))
    if (fact === undefined || fact.id === undefined) return undefined
    randomItems.database.run(`DELETE FROM StaticFacts WHERE id LIKE '${fact.id}'`, [], function (err) {
        if (err) {
            log.error('Error occureed deleting static fact from db.', err)
        } else {
            log.info('Sending static fact!', fact.sentence)
        }
    })
    refresh()
    randomItems.close()
    return fact.sentence
}

var additionalPhrases = []
var getAdditionalPhrases = function () {
    return additionalPhrases
}

// Setup function for all random items
var setup = function () {
    if (lists.items.length === 0) {
        db.setUpDatabases() // Get db
        let randomItems = db.getDatabase('randomItems')
        if (!randomItems) {
            // blank
            log.fatal('No random items.', randomItems)
        } else {
            // Store random items/people/etc. into all possible categories
            randomItems.forEach('Items', row => { // Load Items
                if (row.isAlive) {
                    lists.animals.push(row)
                } else {
                    lists.nonLivingItems.push(row)
                }
                if (row.isFood) {
                    lists.food.push(row)
                } else {
                    lists.inedibles.push(row)
                }
                lists.items.push(row)
            })

            randomItems.forEach('Places', row => { // Load Places
                lists.places.push(row)
            })

            if (config.options.hasStaticFacts) {
                randomItems.forEach('StaticFacts', row => { // Load Static Facts
                    lists.staticFacts.push(row)
                })
            }

            randomItems.forEach('Phrases', row => { // Load additional known phrases
                additionalPhrases.push(row)
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

            log.info('Random Items Setup Complete.')
            randomItems.close()
        }
    }
}

// Refresh with new database items
var refresh = function () {
    log.info('Item Refresh Requested.')
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

// Look for random item by string
var findEntry = function (entryName, isLie) {
    if (typeof entryName !== 'string') return undefined
    let subFind = function (list) {
        let item = getArray(list.list).find(x => {
            let descriptor = (x.usage === undefined)? 'name' : 'plural'
            if (descriptor === 'plural' && `${x.usage} ${x.name}` == entryName) {
                return true
            }
            return stripPunctuation(x[descriptor]).toLowerCase().trim() == entryName
        })
        if (item !== undefined) {
            item = copyObject(item)
            let factTemplate = randomArrayItem(getArray('recursiveFacts').filter(x => {
                let template = []
                x.fact.forEach(x => {
                    if (x.truth === undefined) {
                        template.push(x)
                    } else if (isLie) {
                        template.push(x.lie)
                    } else {
                        template.push(x.truth)
                    }
                })
                template = JSON.stringify(template)
                let res = false
                list.identifiers.forEach(id => {
                    if (template.includes(`["${id}"]`)) {
                        res = true
                    }
                })
                return res
            }))
            if (factTemplate !== undefined) {
                return {
                    ...item,
                    template: copyObject(factTemplate),
                    classifier: list.classifier
                }
            }
        }
    }
    let item = undefined
    let categories = [
        { list: 'animals', identifiers: ['blank', 'animal', 'blanks', 'animals'], classifier: 'item' },
        { list: 'nonLivingItems', identifiers: ['blank', 'item', 'blanks', 'items'], classifier: 'item' },
        { list: 'alive', identifiers: ['person', 'alive'], classifier: 'person' },
        { list: 'dead', identifiers: ['person', 'dead'], classifier: 'person' },
        { list: 'places', identifiers: ['place'], classifier: 'place' }
    ]
    categories.forEach(x => {
        if (item == undefined) {
            item = subFind(x)
        }
    })
    return item
}

module.exports = {
    getAllItems: () => getArray('items'),
    getAnimals: () => getArray('animals'),
    getItems: () => getArray('nonLivingItems'),
    getFood: () => getArray('food'),
    getNonFood: () => getArray('inedibles'),
    getAllPeople: () => getArray('people'),
    getAlivePeople: () => getArray('alive'),
    getDeadPeople: () => getArray('dead'),
    getAllFacts: () => getArray('facts'),
    getPlaces: () => getArray('places'),
    getRecursiveFacts: () => getArray('recursiveFacts'),
    getAdjectives: () => getArray('adjectives'),
    getStaticFact: getStaticFact,
    hasStaticFacts: () => getArray('staticFacts').length > 0,
    setupItems: setup,
    refreshItems: refresh,
    addPerson: addPerson,
    addItem: addItem,
    addAdjective: addAdjective,
    addFact: addFact,
    addPlace: addPlace,
    addStaticFact: addStaticFact,
    getWebFormattedData: formattedData,
    getAdditions: getAdditionalPhrases,
    find: findEntry
}