const { Table } = require("../database")
const { randomArrayItem } = require("logic-kit")

const table = new Table('insults')

function getRandomInsult() {
    return randomArrayItem(table.data).insult
}

module.exports = {
    refresh: () => table.refresh(),
    getRandomInsult
}
