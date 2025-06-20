const { Table } = require("../database")
const logger = require("@adamseidman/logger")
const { copyObject, randomArrayItem, stripPunctuation, shuffleArray } = require("logic-kit")

const table = new Table('allPeople')
let lastPerson = { id: -1 }
let dictionary = null

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

async function addPerson(person, submitted_by) {
    const { error } = await table.client
        .from(table.name)
        .insert({ ...person, submitted_by })
    if (error) {
        logger.error(`Could not insert new person from ${submitted_by}! ${
            JSON.stringify(person)}`, error)
    }
    return error
}

function getDictionary() {
    if (dictionary) {
        return copyObject(dictionary)
    }
    dictionary = {}
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
        shuffleArray(data.tags)
        dictionary[stripPunctuation(data.name).toLowerCase()] = data
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
}

module.exports = {
    refresh,
    getLastPerson,
    getNextPerson,
    addPerson,
    getDictionary,
    getAll
}
