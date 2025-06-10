const items = require("../../db/tables/items")
const stats = require("../../db/tables/stats")
const users = require("../../db/tables/users")
const override = require("../../fact/override")
const people = require("../../db/tables/people")
const places = require("../../db/tables/places")
const tags = require("../../db/tables/extraTags")
const { generateFact } = require("../../fact/construction")

function handle(req, res) {
    const user = users.get(req.user?.id)
    if (!user) {
        return { code: 400 }
    }
    user.stats = stats.getStats(req.user.id)
    const ret = {
        code: 200,
        user,
        fact: generateFact(),
        places: places.getAll(),
        items: items.getAll(),
        people: people.getAll(),
        tags: tags.getTagList(),
    }
    if (user.is_owner) {
        ret.isOverriden = override.isOverridden()
        ret.overrideMsg = override.getOverrideMessage()
    }
    return ret
}

module.exports = handle
