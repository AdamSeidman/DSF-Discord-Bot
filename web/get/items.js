const items = require("../../db/tables/items")

function handle() {
    return {
        code: 200,
        data: items.getAll()
    }
}

module.exports = handle
