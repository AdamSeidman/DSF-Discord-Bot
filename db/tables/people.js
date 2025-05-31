const { Table } = require('../database')
const { copyObject, randomArrayItem } = require('../../utils/utils')

const table = new Table('allPeople')
let lastPerson = { id: -1 }

function getLastPerson() {
    let person = lastPerson
    if (person.id < 0) {
        person = getNextPerson()
    }
    return copyObject(person)
}

function getNextPerson(filters) {
    let data = table.data.filter(x => x.id !== lastPerson.id)
    if (filters?.male !== undefined) {
        data = data.filter(x => x.is_male === filters.male)
    }
    if (filters?.alive !== undefined) {
        data = data.filter(x => x.is_alive === filters.alive)
    }
    const person = randomArrayItem(data)
    lastPerson = copyObject(person)
    return person
}

module.exports = {
    refresh: () => table.refresh(),
    getLastPerson,
    getNextPerson
}
