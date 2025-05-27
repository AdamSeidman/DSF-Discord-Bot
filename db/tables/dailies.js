const { Table } = require('../database')

const table = new Table('dailyChannels')

function getAll() {
    return table.data
}

module.exports = {
    refresh: () => table.refresh(),
    getAll
}
