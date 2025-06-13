const { post } = require("../util/post")
const { addItem } = require("../../db/tables/items")

async function handle(req) {
    return await post(req, 'submit_new_items', addItem)
}

module.exports = handle
