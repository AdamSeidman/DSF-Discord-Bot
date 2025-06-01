const { getAcronym } = require("../../db/tables/acronyms")
const { argModifier, handleMultiCommand } = require("./fact")

module.exports = {
    response: (msg, params) => {
        handleMultiCommand(msg, params, getAcronym)
        // TODO track
    },
    argModifier: (builder) => argModifier(builder, 'acronyms'),
    helpMsg: 'Gives a DSF acronym.'
}
