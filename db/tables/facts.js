const { Table } = require("../database")
const logger = require("@adamseidman/logger")

const table = new Table('factTemplates', validateTable)

function validateTable(tbl) {
    tbl.data.forEach((row) => {
        try {
            JSON.parse(row.template)
        } catch {
            logger.error(`Could not parse template ${row.id}!`, row.template)
        }
    })
}

function getAllTemplates() {
    return table.data.map(({ id, can_recurse, template }) => {
        return {
            canRecurse: can_recurse,
            template: JSON.parse(template),
            id
        }
    })
}

async function refresh() {
    await table.refresh()
    validateTable(table)
}

module.exports = {
    refresh,
    getAllTemplates
}
