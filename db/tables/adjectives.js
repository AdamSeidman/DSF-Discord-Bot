const { Table } = require("../database")

const table = new Table('respAdjectives')

function getAll() {
    return table.data.map(x => x.term)
}

module.exports = {
    refresh: () => table.refresh(),
    getAll
}
