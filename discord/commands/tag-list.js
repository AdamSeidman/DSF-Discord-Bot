const facts = require("@facts/construction")
const { createTextList } = require("logic-kit")
const { getTagList } = require("@tables/extraTags")

const objectExampleText = createTextList([
    '{"truth":"is true","lie":"is false"}',
    '\n{"high":1999,"low":1950}  ("param": [none], words, ordinal, wordsOrdinal)'
])

module.exports = {
    response: (msg) => {
        return msg.reply(`Tag List:\n${
            [...facts.tagList, ...getTagList(), ...facts.itemTypes.map(x => `${x}s`)].sort().join(', ')
        }\n\nObject Examples:\n${objectExampleText}`)
    },
    isTesterCommand: true,
    altMsg: 'Helpful lists for doing fact construction.'
}
