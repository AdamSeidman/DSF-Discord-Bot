const { post } = require("../util/post")
const { addTemplate } = require("../../db/tables/facts")

async function handle(req) {
    return await post(req, 'submit_new_templates', addTemplate)
}

module.exports = handle
