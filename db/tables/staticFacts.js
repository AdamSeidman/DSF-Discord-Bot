const { randomArrayItem } = require("logic-kit")
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

async function addStaticFact(submission) {
    if (typeof submission?.name === 'string' && submission.name.trim().length > 0) {
        logger.info('Adding static fact...', submission.name)
        const { error } = await table.client
            .from(table.name)
            .insert({
                fact: submission.name
            })
        if (error) {
            logger.error(`Could not insert new static fact: "${
                submission.name}"`, error)
        }
        return error
    } else {
        return true
    }
}

async function getAndMark() {
    const fact = randomArrayItem(getUsableFacts())
    if (!fact?.id) return
    usedIdCache.push(fact.id)
    const { error } = await table.client
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
    addStaticFact,
    getAndMark
}
