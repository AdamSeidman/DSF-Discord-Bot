const { randomArrayItem } = require("../../utils/utils")
const { Table } = require("../database")

const tableLibrary = {}
const tagTable = new Table('dynamicTags', loadTableLibrary)

function loadTableLibrary() {
    tagTable.data.forEach((row) => {
        tableLibrary[row.table_name] = {
            table: new Table(`tag${row.table_name.slice(0, 1).toUpperCase()}${row.table_name.slice(1)}`),
            tag: row.table_name,
            id: row.id
        }
    })
}

function getRandomTagItem(tag) {
    tag = tag.trim().toLowerCase()
    if (Object.keys(tableLibrary).includes(tag)) {
        return randomArrayItem(tableLibrary[tag].table.data.map(x => x.word))
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
    Object.values(tableLibrary).forEach(({ table }) => {
        table.refresh()
    })
}

module.exports = {
    refresh,
    getTagList: () => Object.keys(tableLibrary),
    getRandomTagItem
}
