const { Table } = require('../database')

const table = new Table('respPhrases')

function getPhrase(toFind) {
    return table.data.find(({ phrase }) => phrase.includes(toFind))
}

module.exports = {
    refresh: () => table.refresh(),
    getPhrase
}
