const { Table } = require('../database')
const { copyObject, randomArrayItem } = require('../../utils/utils')

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

module.exports = {
    refresh: () => table.refresh(),
    getLastItem,
    getNextItem
}
