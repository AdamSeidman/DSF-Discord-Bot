const { Table } = require("../database")
const { randomArrayItem } = require("logic-kit")

const tableLibrary = {}
const tagTable = new Table('dynamicTags', loadTableLibrary)

function loadTableLibrary() {
    tagTable.data.forEach((row) => {
        tableLibrary[row.table_name] = {
            table: new Table(`tag${row.table_name.slice(0, 1).toUpperCase()}${row.table_name.slice(1)}`),
            tag: row.table_name,
            has_dictionary: row.has_dictionary,
            id: row.id,
            lastId: -1
        }
    })
}

function getRandomTagItem(tag) {
    tag = tag.trim().toLowerCase()
    if (Object.keys(tableLibrary).includes(tag)) {
        const table = tableLibrary[tag]
        return randomArrayItem(table.table.data.filter(x => x.id !== table.lastId).map(x => x.word))
    }
}

async function refresh() {
    await tagTable.refresh()
    tagTable.data.forEach((row) => {
        if (!Object.keys(tableLibrary).includes(row.table_name)) {
            tableLibrary[row.table_name] = new Table(
                `tag${row.table_name.slice(0, 1).toUpperCase()}${row.table_name.slice(1)}`)
        }
    })
    let refreshPromises = []
    Object.values(tableLibrary).forEach(({ table }) => {
        refreshPromises.push(table.refresh())
    })
    await Promise.all(refreshPromises)
}

module.exports = {
    refresh,
    getTagList: () => Object.keys(tableLibrary),
    getRandomTagItem
}
