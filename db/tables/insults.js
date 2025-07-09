const { Table } = require("../database")
const { randomArrayItem } = require("logic-kit")

const table = new Table('insults')

function getRandomInsult() {
    return randomArrayItem(table.data).insult
}

async function addInsult(insult, submitted_by) {
    insult = insult?.name
    if (typeof insult !== 'string') {
        return new Error('Incorrect insult type.')
    }
    const { error } = await table.client
        .from(table.name)
        .insert({ insult, submitted_by })
    if (error) {
        logger.error(`Could not insert new insult from ${submitted_by
            }! ${insult}`, error)
    }
    return error
}

module.exports = {
    refresh: () => table.refresh(),
    getRandomInsult,
    addInsult
}
