const items = require("../../db/tables/items")
const users = require("../../db/tables/users")
const override = require("../../fact/override")
const people = require("../../db/tables/people")
const places = require("../../db/tables/places")
const tags = require("../../db/tables/extraTags")
const { generateFact } = require("../../fact/construction")

function handle(req, res) {
    const user = users.get(req.user?.id) || null
    if (!user) {
        return { code: 400 }
    }
    const ret = {
        code: 200,
        user,
        fact: generateFact(),
        places: places.getAll(),
        items: items.getAll(),
        people: people.getAll(),
        tags: tags.getTagList()
    }
    if (user.is_owner) {
        ret.isOverriden = override.isOverridden()
        ret.overrideMsg = override.getOverrideMessage()
    }
    return ret
}

module.exports = handle
