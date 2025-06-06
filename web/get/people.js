const people = require("../../db/tables/people")

function handle() {
    return {
        code: 200,
        data: people.getAll()
    }
}

module.exports = handle
