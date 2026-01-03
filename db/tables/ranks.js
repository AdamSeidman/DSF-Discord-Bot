const { Table } = require("../database")
const logger = require("@adamseidman/logger")
const { randomArrayItem } = require("logic-kit")

let ranks = null
const table = new Table('ranks', (tbl) => {
    ranks = tbl.data.map(x => x.rank.trim().toLowerCase())
})

function isRank(str) {
    if (typeof str !== 'string' || ranks === null) return false
    return ranks.includes(str.trim().toLowerCase())
}

function getRandomRank() {
    return randomArrayItem(table.data).rank
}

async function addRank(rank, submitted_by) {
    rank = rank?.name
    if (typeof rank !== 'string') {
        return new Error('Incorrect rank type.')
    }
    if (isRank(rank)) {
        return new Error('Provided item is already a rank.')
    }
    const { error } = await table.client
        .from(table.name)
        .insert({ rank, submitted_by })
    if (error) {
        logger.error(`Could not insert new rank from ${submitted_by}! ${rank}`, error)
    }
    return error
}

async function refresh() {
    await table.refresh()
    ranks = table.data.map(x => x.rank.trim().toLowerCase())
}

module.exports = {
    refresh,
    isRank,
    addRank,
    getRandomRank
}
