const { post } = require("../util/post")
const { addInsult } = require("@tables/insults")

async function handle(req) {
    return await post(req, 'submit_insults', addInsult)
}

module.exports = handle
