const { killPerson } = require("@tables/people")
const users = require("@tables/users")

async function handle(req) {
    const user = users.get(req.user?.id)
    if (!user) {
        return 401
    }
    if (!user.submit_new_places) {
        return 403
    }
    if (typeof req.body?.name !== 'string' || req.body.name.trim().length < 1) {
        return 400
    }
    const error = await killPerson(req.body.name)
    if (!error) {
        return 200
    } else {
        return {
            code: 422,
            error
        }
    }
}

module.exports = handle
