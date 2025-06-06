const { Table } = require("../database")
const { copyObject, randomArrayItem, stripPunctuation } = require("logic-kit")

const table = new Table('allItems')
let lastItem = { id: -1 }

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

function getDictionary() {
    const result = {} // TODO All dictionaries should only rebuild after refresh and should shuffle tags
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
        const name = stripPunctuation
        result[stripPunctuation(data.name).toLowerCase()] = data
        result[stripPunctuation(data.plural).toLowerCase()] = data
        result[stripPunctuation(`${data.usage} ${data.name}`).toLowerCase()] = data
    })
    return result
}

function getAll() {
    return table.data
}

module.exports = {
    refresh: () => table.refresh(),
    getLastItem,
    getNextItem,
    getDictionary,
    getAll
}
