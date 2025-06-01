const { generateLie } = require("../../fact/construction")
const { argModifier, handleMultiCommand } = require("./fact")

module.exports = {
    response: (msg, params) => {
        const numLies = handleMultiCommand(msg, params, generateLie)
        // TODO track
    },
    argModifier: (builder) => argModifier(builder, 'lies'),
    helpMsg: 'Sends a lie.'
}
