const facts = require('../db/tables/facts')
const items = require('../db/tables/items')
const people = require('../db/tables/people')
const { isStringTerminated, randomArrayItem } = require('../utils/utils')
const { isOverridden, getOverrideMessage } = require('./override')

let itemPrepared = false
let personPrepared = false
const queue = []

function parseStringTag(tag) {
    if (tag.length < 1) return 'BAD_TAG_LENGTH'
    if (tag.includes('_')) {
        return people.getLastPerson().is_male? tag.split('_')[0] : tag.split('_')[1]
    }
    let baseTag = tag.endsWith('s')? tag.slice(0, -1) : tag
    if (facts.usageTerm === baseTag) {
        return items.getLastItem().usage
    } else if (baseTag.startsWith(facts.preparePrefix)) {
        baseTag = baseTag.slice(facts.preparePrefix.length)
        if (facts.personTypes.includes(baseTag)) {
            queue.unshift(facts.tagDictionary[baseTag]())
            personPrepared = true
        } else if (facts.itemTypes.includes(baseTag)) {
            queue.unshift(facts.tagDictionary[baseTag]())
            itemPrepared = true
        } else {
            return 'UNKNOWN_PREPARE_TAG'
        }
        return ''
    } else if (facts.itemTypes.includes(baseTag)) {
        let item = itemPrepared? items.getLastItem() : facts.tagDictionary[baseTag]()
        item = (baseTag === tag)? item.name : item.plural
        if (itemPrepared) {
            itemPrepared = false
        } else {
            queue.unshift(item)
        }
        return item
    } else if (facts.personTypes.includes(baseTag)) {
        let person = personPrepared? people.getLastPerson() : facts.tagDictionary[baseTag]()
        person = person.name
        if (personPrepared) {
            personPrepared = false
        } else {
            queue.unshift(person)
        }
        return person
    } else if (Object.keys(facts.tagDictionary).includes(tag)) {
        let term = facts.tagDictionary[tag]()
        queue.unshift(term)
        return term
    } else {
        return 'UNKNOWN_STRING_TAG'
    }
}

function parseTag(tag) {
    if (typeof tag === 'string') {
        return parseStringTag(tag)
    }
    if (typeof tag === 'number') {
        if (queue.length < tag) {
            return 'QUEUE_LENGTH_ERROR'
        } else {
            let item = queue[tag - 1]
            return (typeof item === 'string')? item : (item.name || item.term)
        }
    } else {
        return 'UNKNOWN_TAG_TYPE'
    }
}

function generate(isFact) {
    let template = isFact? facts.getFactTemplate() : facts.getLieTemplate()
    // console.log(template) // TODO remove
    template = template.map((item) => {
        if (Array.isArray(item)) {
            return (item.length === 1)? parseTag(item[0]) : randomArrayItem(item)
        } else if (typeof item === 'string') {
            return item
        } else {
            return 'UNKNOWN_ITEM_ERROR'
        }
    }).join('')
    personPrepared = false
    itemPrepared = false
    if (typeof template !== 'string' || template.length < 2) {
        return 'TEMPLATE_ERROR'
    }
    return template.slice(0, 1).toUpperCase() + template.slice(1) + 
        (isStringTerminated(template)? '' : '.')
}

function generateFact() {
    if (isOverridden()) {
        return getOverrideMessage()
    }
    return generate(true)
}

function generateLie() {
    if (isOverridden()) {
        return `This is a lie: ${getOverrideMessage()}`
    }
    return generate(false)
}

module.exports = {
    generateFact,
    generateLie
}
