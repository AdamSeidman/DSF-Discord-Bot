const { createTextList } = require("logic-kit")
const facts = require("../../fact/construction")
const { getTagList } = require("../../db/tables/extraTags")

const objectExampleText = createTextList([
    '{"truth":"is true","lie":"is false"}',
    '{"high":1999,"low":1950}'
])

module.exports = {
    response: (msg) => {
        msg.reply(`Tag List:\n${
            [...facts.tagList, ...getTagList(), ...facts.itemTypes.map(x => `${x}s`)].sort().join(', ')
        }\n\nObject Examples:\n${objectExampleText}`)
    },
    isTesterCommand: true,
    altMsg: 'Helpful lists for doing fact construction.'
}
