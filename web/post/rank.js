const { post } = require("../util/post")
const { addRank } = require("@tables/ranks")

async function handle(req) {
    return await post(req, 'submit_ranks', addRank)
}

module.exports = handle
