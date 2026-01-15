const { parseFactTemplate, parseLieTemplate } = require("@facts/construction")

const NUM_EXAMPLES = 3

function handle(req) {
    let template = req.body?.template
    if (typeof template === 'string') {
        template = template.trim()
    } else {
        return 400
    }
    try {
        JSON.parse(template)
    } catch {
        return 400
    }
    const facts = []
    const lies = []
    for (let _ of new Array(NUM_EXAMPLES)) {
        facts.push(parseFactTemplate(template))
        lies.push(parseLieTemplate(template))
    }
    return {
        code: 200,
        data: { facts, lies }
    }
}

module.exports = handle
