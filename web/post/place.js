const { post } = require("../util/post")
const { addPlace } = require("../../db/tables/places")

async function handle(req) {
    return await post(req, 'submit_new_places', addPlace)
}

module.exports = handle
