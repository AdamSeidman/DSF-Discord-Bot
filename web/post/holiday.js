const { post } = require("../util/post")
const { addHoliday } = require("@tables/holidays")

async function handle(req) {
    return await post(req, 'submit_holidays', addHoliday)
}

module.exports = handle
