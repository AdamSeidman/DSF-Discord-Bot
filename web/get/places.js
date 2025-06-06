const places = require("../../db/tables/places")

function handle() {
    return {
        code: 200,
        data: places.getAll()
    }
}

module.exports = handle
