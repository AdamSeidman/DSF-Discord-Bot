const { Table } = require("../database")
const logger = require("@adamseidman/logger")
const { copyObject, randomArrayItem, stripPunctuation } = require("logic-kit")

const table = new Table('allPlaces')
let lastPlace = { id: -1 }
let dictionary = null

function getLastPlace() {
    let place = lastPlace
    if (place.id < 0) {
        place = getNextPlace()
    }
    return copyObject(place).name
}

function getNextPlace() {
    lastPlace = randomArrayItem(table.data.filter(x => x.id !== lastPlace.id))
    return lastPlace.name
}

async function addPlace(place, submitted_by) {
    const { error } = await table.client
        .from(table.name)
        .insert({ ...place, submitted_by })
    if (error) {
        logger.error(`Could not insert new place from ${submitted_by}! ${
            JSON.stringify(place)}`, error)
    }
    return error
}

function getDictionary() {
    if (dictionary) {
        return copyObject(dictionary)
    }
    dictionary = {}
    table.data.forEach((place) => {
        dictionary[stripPunctuation(place.name).toLowerCase()] = {
            tags: ['place', 'noun'],
            name: place.name
        }
    })
    return copyObject(dictionary)
}

function getAll() {
    return table.data
}

function refresh() {
    table.refresh()
        .then(() => {
            dictionary = null
        })
        .catch(logger.warn)
}

module.exports = {
    refresh,
    getLastPlace,
    getNextPlace,
    addPlace,
    getDictionary,
    getAll
}
