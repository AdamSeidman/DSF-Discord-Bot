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

module.exports = {
    refresh: () => table.refresh(),
    getLastPlace,
    getNextPlace
}
