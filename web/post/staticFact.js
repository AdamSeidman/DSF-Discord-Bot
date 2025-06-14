const { post } = require("../util/post")
const { addStaticFact } = require("@tables/staticFacts")

async function handle(req) {
    return await post(req, 'submit_static_facts', addStaticFact)
}

module.exports = handle
