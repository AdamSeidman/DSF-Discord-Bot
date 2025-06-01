const stats = require("../../db/tables/stats")
const { generateLie } = require("../../fact/construction")
const { argModifier, handleMultiCommand } = require("./fact")

module.exports = {
    response: (msg, params) => {
        const num = handleMultiCommand(msg, params, generateLie)
        stats.updateStat(msg, 'lie', num)
    },
    argModifier: (builder) => argModifier(builder, 'lies'),
    helpMsg: 'Sends a lie.'
}
