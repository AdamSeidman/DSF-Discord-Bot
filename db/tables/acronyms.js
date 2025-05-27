const { Table } = require('../database')
const { randomArrayItem } = require('../../utils/utils')

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
        .catch(() => {})
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
