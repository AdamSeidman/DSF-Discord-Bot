const users = require("../../db/tables/users")
const { generateFact } = require("../../fact/construction")

function handle(req) {
    return {
        code: 200,
        data: users.get(req.user?.id) || null,
        fact: generateFact()
    }
}

module.exports = handle
