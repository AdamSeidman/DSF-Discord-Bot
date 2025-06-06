const { Table } = require("../database")
const { copyObject, randomArrayItem, stripPunctuation } = require("logic-kit")

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

function getDictionary() {
    const result = {}
    table.data.forEach((person) => {
        const data = {
            tags: [
                'person',
                (person.is_male? 'male' : 'female'),
                (person.is_alive? 'alive' : 'dead'),
                'noun'
            ],
            name: person.name
        }
        result[stripPunctuation(data.name).toLowerCase()] = data
    })
    return result
}

function getAll() {
    return table.data
}

module.exports = {
    refresh: () => table.refresh(),
    getLastPerson,
    getNextPerson,
    getDictionary,
    getAll
}
