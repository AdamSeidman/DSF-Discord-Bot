const factCheck = require("./fact-check")

module.exports = {
    response: (msg, params) => {
        let template = ''
        if (params.injected) {
            template = params.params.join(' ')
        } else {
            template = msg.options.getString('template') || ''
        }
        template = template.replace(/“|”|„|‟|〝|〞|＂/g, '"')
        return factCheck.parseInput(msg, params, template)
    },
    argModifier: factCheck.argModifier,
    isTesterCommand: true,
    altMsg: 'Check a fact template, but for our special boy.'
}
