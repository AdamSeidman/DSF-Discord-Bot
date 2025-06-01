const { Table } = require("../database")
const logger = require("@adamseidman/logger")

const table = new Table('staticFacts')
const usedIdCache = []

function getUsableFacts() {
    return table.data.filter(x => !x.used && !usedIdCache.includes(x.id))
}

function getNumUnused() {
    return getUsableFacts().length
}

function getAndMark() {
    const fact = randomArrayItem(getUsableFacts())
    if (!fact?.id) return
    usedIdCache.push(fact.id)
    const { error } = table.client
        .from(table.name)
        .update({
            used: true
        })
        .eq('id', fact.id)
    if (error) {
        logger.error('Could not mark fact ' + fact.id, error)
    }
    return fact.fact
}

module.exports = {
    refresh: () => table.refresh(),
    getNumUnused,
    getAndMark
}
