const { Table } = require("../database")
const { copyObject, randomArrayItem } = require("logic-kit")

const table = new Table('allPlaces')
let lastPlace = { id: -1 }

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

function getDictionary() {
    const result = {}
    table.data.forEach((place) => {
        result[place.name] = {
            tags: ['place', 'noun'],
            name: place.name
        }
    })
    return result
}

module.exports = {
    refresh: () => table.refresh(),
    getLastPlace,
    getNextPlace,
    getDictionary
}
