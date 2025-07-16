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
    return table.data.map(({ id, can_recurse, template }) => ({
        canRecurse: can_recurse,
        template: JSON.parse(template),
        id
    }))
}

async function addTemplate(submission) {
    if (submission?.name?.trim().length > 0 && typeof submission.can_recurse === 'boolean') {
        try {
            if (!Array.isArray(JSON.parse(submission.name.trim()))) {
                return true
            }
        } catch {
            return true
        }
        logger.info('Adding fact template...', submission.name)
        const { error } = await table.client
            .from(table.name)
            .insert({
                template: submission.name,
                can_recurse: submission.can_recurse
            })
        if (error) {
            logger.error(`Could not insert new fact template: "${submission.name}"`, error)
        }
        return error
    } else {
        return true
    }
}

async function refresh() {
    await table.refresh()
    validateTable(table)
}

module.exports = {
    refresh,
    getAllTemplates,
    addTemplate
}
