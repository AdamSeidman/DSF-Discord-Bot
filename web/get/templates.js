const { getAllTemplates } = require("../../db/tables/facts")

function handle(req, res) {
    return {
        code: 200,
        data: getAllTemplates()
    }
}

module.exports = handle
