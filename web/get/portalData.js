const items = require("@tables/items")
const stats = require("@tables/stats")
const users = require("@tables/users")
const people = require("@tables/people")
const places = require("@tables/places")
const tags = require("@tables/extraTags")
const override = require("@facts/override")
const { generateFact } = require("@facts/construction")

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
