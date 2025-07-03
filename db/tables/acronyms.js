const { Table } = require("../database")
const logger = require("@adamseidman/logger")
const { randomArrayItem } = require("logic-kit")

const dTable = new Table('dAdverbs')
const sTable = new Table('sAdjectives')
const fTable = new Table('fNouns')

function refresh() {
    dTable.refresh()
        .then(() => {
            return sTable.refresh()
        })
        .then(() => {
            return fTable.refresh()
        })
        .catch(logger.warn)
}

function getAcronym() {
    return `${
        randomArrayItem(dTable.data).word
    } ${
        randomArrayItem(sTable.data).word
    } ${
        randomArrayItem(fTable.data).word
    }`
}

module.exports = {
    refresh,
    getAcronym
}
