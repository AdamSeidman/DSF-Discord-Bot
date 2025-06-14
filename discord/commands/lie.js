const stats = require("@tables/stats")
const { generateLie } = require("@facts/construction")
const { argModifier, handleMultiCommand } = require("./fact")

module.exports = {
    response: (msg, params) => {
        const num = handleMultiCommand(msg, params, generateLie)
        stats.updateStat(params.user, 'lie', num)
    },
    argModifier: (builder) => argModifier(builder, 'lies'),
    helpMsg: 'Sends a lie.'
}
