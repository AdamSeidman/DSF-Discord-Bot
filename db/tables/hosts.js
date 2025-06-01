const { Table } = require("../database")

const table = new Table('hosts')

function getAll() {
    return table.data
}

module.exports = {
    refresh: () => table.refresh(),
    getAll
}
