const { post } = require("../util/post")
const { addPerson } = require("@tables/people")

async function handle(req) {
    return await post(req, 'submit_new_people', addPerson)
}

module.exports = handle
