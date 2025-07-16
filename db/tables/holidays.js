const { Table } = require("../database")
const logger = require("@adamseidman/logger")

const table = new Table('extraHolidays')

async function addHoliday(holiday, submitted_by) {
    logger.debug(`New holiday submitted by ${submitted_by} (${
        holiday?.name})`, holiday)
    const { error } = await table.client
        .from(table.name)
        .insert({ ...holiday, submitted_by })
    if (error) {
        logger.error(`Could not insert new item from ${submitted_by} ${
            JSON.stringify(holiday)}!`, error)
    } else {
        await table.refresh()
    }
    return error
}

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
    getAll,
    addHoliday
}
