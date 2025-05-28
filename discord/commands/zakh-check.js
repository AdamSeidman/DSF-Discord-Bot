const checkCmd = require("./fact-check");

module.exports = {
    response: (msg, params) => {
        // TODO Modify params, etc
        return checkCmd(msg, params)
    },
    argModifier: checkCmd.argModifier,
    isTesterCommand: true
}
