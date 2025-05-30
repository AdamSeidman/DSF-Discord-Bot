const { tagDictionary } = require('../../db/tables/facts')
const { argModifier, handleMultiCommand } = require('./fact')

module.exports = {
    response: (msg, params) => {
        handleMultiCommand(msg, params, tagDictionary.gibberish)
    },
    argModifier: (builder) => argModifier(builder, 'gibberishes'),
    helpMsg: 'Just try it...'
}
