const users = require("../../db/tables/users")

function handle(req) {
    return {
        code: 200,
        data: users.get(req.user?.id) || null
    }
}

module.exports = handle
