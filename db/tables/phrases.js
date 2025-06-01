const { Table } = require("../database")

const table = new Table('respPhrases')

function getPhrase(toFind) {
    return table.data.find(({ phrase }) => toFind.includes(phrase))
}

module.exports = {
    refresh: () => table.refresh(),
    getPhrase
}
