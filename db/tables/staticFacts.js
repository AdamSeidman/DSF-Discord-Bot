const { Table } = require('../database')

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
    usedIdCache.push(fact.id)
    table.update(fact.id, {
        used: true
    })
    return fact.fact
}

module.exports = {
    refresh: () => table.refresh(),
    getNumUnused,
    getAndMark
}
