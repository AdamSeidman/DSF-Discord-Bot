const { Table } = require("../database")
const logger = require("@adamseidman/logger")
const { copyObject, randomArrayItem, stripPunctuation, shuffleArray } = require("logic-kit")

const table = new Table('allItems')
let lastItem = { id: -1 }
let dictionary = null

function getLastItem() {
    let item = lastItem
    if (item.id < 0) {
        item = getNextItem()
    }
    return copyObject(item)
}

function getNextItem(filters) {
    let data = table.data.filter(x => x.id !== lastItem.id)
    if (filters?.alive !== undefined) {
        data = data.filter(x => x.is_alive === filters.alive)
    }
    if (filters?.food !== undefined) {
        data = data.filter(x => x.is_food === filters.food)
    }
    const item = randomArrayItem(data)
    lastItem = copyObject(item)
    return item
}

async function addItem(item, submitted_by) {
    const { error } = await table.client
        .from(table.name)
        .insert({ ...item, submitted_by })
    if (error) {
        logger.error(`Could not insert new item from ${submitted_by} ${
            JSON.stringify(item)}!`, error)
    }
    return error
}

function getDictionary() {
    if (dictionary) {
        return copyObject(dictionary)
    }
    dictionary = {}
    table.data.forEach((item) => {
        const data = {
            tags: ['blank', 'blanks', 'noun'],
            name: item.name,
            plural: item.plural,
            usage: item.usage
        }
        if (item.is_food) {
            data.tags.push('food', 'foods')
        } else {
            data.tags.push('inedible', 'inedibles')
        }
        if (item.is_alive) {
            data.tags.push('animal', 'animals')
        } else {
            data.tags.push('item', 'items')
        }
        shuffleArray(data.tags)
        dictionary[stripPunctuation(data.name).toLowerCase()] = data
        dictionary[stripPunctuation(data.plural).toLowerCase()] = data
        dictionary[stripPunctuation(`${data.usage} ${data.name}`).toLowerCase()] = data
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
    getLastItem,
    getNextItem,
    addItem,
    getDictionary,
    getAll
}
