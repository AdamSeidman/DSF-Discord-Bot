const { post } = require("../util/post")
const { addTemplate } = require("@tables/facts")

async function handle(req) {
    return await post(req, 'submit_new_templates', addTemplate)
}

module.exports = handle
