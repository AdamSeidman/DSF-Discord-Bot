const { getGibberish } = require("../../fact/construction")
const { argModifier, handleMultiCommand } = require("./fact")

module.exports = {
    response: (msg, params) => {
        handleMultiCommand(msg, params, getGibberish)
    },
    argModifier: (builder) => argModifier(builder, 'gibberishes'),
    helpMsg: 'Just try it...'
}
