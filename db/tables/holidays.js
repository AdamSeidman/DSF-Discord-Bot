const { Table } = require("../database")

const table = new Table('extraHolidays')

function getAll() {
    const year = new Date().getFullYear()
    return table.data.map(({ name, day, month }) => ({
        name,
        countryCode: 'DSF',
        date: `${year}-${
            String(month).padStart(2, '0')}-${
            String(day).padStart(2, '0')}`
    }))
}

module.exports = {
    refresh: () => table.refresh(),
    getAll
}
