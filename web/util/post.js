const users = require("../../db/tables/users")

async function post(req, perm, addFn) {
    const user = users.get(req.user?.id)
    if (!user) {
        return 401
    }
    if (!user[perm]) {
        return 403
    }
    const submission = req.body?.submission || {}
    if (typeof submission.name !== 'string') {
        return 400
    }
    const error = await addFn(req.body.submission, req.user.username)
    if (error) {
        return {
            code: 500,
            error
        }
    }
    return 201
}

module.exports = { post }
