const stats = require("../../db/tables/stats")
const { getAcronym } = require("../../db/tables/acronyms")
const { argModifier, handleMultiCommand } = require("./fact")

module.exports = {
    response: (msg, params) => {
        const num = handleMultiCommand(msg, params, getAcronym)
        stats.updateStat(params.user, 'acronym', num)
    },
    argModifier: (builder) => argModifier(builder, 'acronyms'),
    helpMsg: 'Gives a DSF acronym.'
}
