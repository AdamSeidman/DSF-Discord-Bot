const items = require("../db/tables/items")
const facts = require("../db/tables/facts")
const people = require("../db/tables/people")
const places = require("../db/tables/places")
const acronym = require("../db/tables/acronyms")
const { randomArrayItem, copyObject, randomNumber,
    shuffleArray, isStringTerminated } = require("logic-kit")
const dynamicTags = require("../db/tables/extraTags")

const FACT_CACHE_SIZE = 5

const usePrefix = 'use'
const preparePrefix = 'prepare'
const usageTerm = 'usage'
const itemTypes = ['blank', 'item', 'food', 'inedible', 'animal'] // TODO
const personTypes = ['alive', 'dead', 'person', 'male', 'female'] // TODO

let itemPrepared = false
let personPrepared = false
let lastTemplateIds = Array(FACT_CACHE_SIZE).fill(-1)
const queue = []

const tagDictionary = {
    acronym: () => acronym.getAcronym(),
    alive: () => people.getNextPerson({ alive: true }),
    animal: () => items.getNextItem({ alive: true }),
    blank: () => items.getNextItem(),
    dead: () => people.getNextPerson({ alive: false }),
    fact: () => 'INTERNAL_GENERATION_ERROR',
    female: () => people.getNextPerson({ male: false }),
    food: () => items.getNextItem({ food: true }),
    inedible: () => items.getNextItem({ food: false }),
    item: () => items.getNextItem({ alive: false }),
    male: () => people.getNextPerson({ male: true }),
    number: () => `${randomNumber()}`,
    person: () => people.getNextPerson(),
    place: () => places.getNextPlace(),
}
tagDictionary.gibberish = () => { // TODO clean up?
    let arr = []
    for (let i = 0; i < 5; i++) {
        arr = [...arr, ...getParsedTemplate(true).split(' ')]
    }
    return shuffleArray(arr).slice(0, randomNumber(3, 10)).join(' ')
}
tagDictionary.noun = () => {
    const term = tagDictionary[randomArrayItem(['person', 'place', 'blank'])]()
    return term.name ?? term
}

function getNextSubTemplate(mustNotRecurse=false) {
    let templates = facts.getAllTemplates().filter(x => !lastTemplateIds.includes(x.id))
    if (mustNotRecurse) {
        templates = templates.filter(x => x.canRecurse)
    }
    const template = randomArrayItem(templates)
    lastTemplateIds = [...lastTemplateIds.slice(1), template.id]
    return template.template
}

function injectSubFacts(template) {
    const out = []
    template.forEach((tag) => {
        if (Array.isArray(tag) && tag.length === 1 && tag[0].toLowerCase() === 'fact') {
            const subTemplate = getNextSubTemplate(true)
            out.push(...subTemplate)
        } else {
            out.push(tag)
        }
    })
    return out
}

function getNextTemplate() {
    let template = getNextSubTemplate()
    if (JSON.stringify(template).toLowerCase().includes('["fact"]')) {
        template = injectSubFacts(template)
    }
    return copyObject(template)
}

function parseMacros(template) {
    const out = []
    template.forEach((tag) => {
        if (Array.isArray(tag) && tag.length === 1 && (`${tag[0]}`).toLowerCase().startsWith(usePrefix)) {
            const baseTag = tag[0].slice(usePrefix.length)
            out.push([`${preparePrefix}${baseTag}`], [usageTerm], ' ', [baseTag])
        } else {
            out.push(tag)
        }
    })
    return out
}

function parseObjects(template, isFact) {
    return template.map((tag) => {
        if (typeof tag === 'object') {
            if (tag.truth || tag.lie) {
                return isFact? tag.truth : tag.lie
            } else if (tag.low || tag.high) {
                return [`${randomNumber(tag.low, tag.high)}`]
            }
        }
        return tag
    })
}

function parseLists(template) {
    return template.map((tag) => {
        if (Array.isArray(tag) && tag.length > 1) {
            return randomArrayItem(tag)
        }
        return tag
    })
}

function parseStringTag(tag) {
    if (tag.length < 1) return 'BAD-TAG-LENGTH'
    if (tag.includes('_')) {
        return people.getLastPerson().is_male? tag.split('_')[0] : tag.split('_')[1]
    }
    let baseTag = tag.endsWith('s')? tag.slice(0, -1) : tag
    if (usageTerm === baseTag) {
        return items.getLastItem().usage
    } else if (baseTag.startsWith(preparePrefix)) {
        baseTag = baseTag.slice(preparePrefix.length)
        if (personTypes.includes(baseTag)) {
            queue.unshift(tagDictionary[baseTag]())
            personPrepared = true
        } else if (itemTypes.includes(baseTag)) {
            queue.unshift(tagDictionary[baseTag]())
            itemPrepared = true
        } else {
            return 'UNKNOWN-PREPARE-TAG'
        }
        return ''
    } else if (itemTypes.includes(baseTag)) {
        let item = itemPrepared? items.getLastItem() : tagDictionary[baseTag]()
        item = (baseTag === tag)? item.name : item.plural
        if (itemPrepared) {
            itemPrepared = false
        } else {
            queue.unshift(item)
        }
        return item
    } else if (personTypes.includes(baseTag)) {
        let person = personPrepared? people.getLastPerson() : tagDictionary[baseTag]()
        person = person.name
        if (personPrepared) {
            personPrepared = false
        } else {
            queue.unshift(person)
        }
        return person
    } else if (Object.keys(tagDictionary).includes(tag)) {
        let term = tagDictionary[tag]()
        queue.unshift(term)
        return term
    } else if (dynamicTags.getTagList().includes(tag)) {
        let term = dynamicTags.getRandomTagItem(tag)
        queue.unshift(term)
        return term
    } else {
        console.log(tag) // TODO

        return 'UNKNOWN-STRING-TAG'
    }
}

function parseTag(tag) {

    if (typeof tag === 'string') {
        return parseStringTag(tag)
    }
    if (typeof tag === 'number') {
        if (queue.length < tag) {
            return 'QUEUE-LENGTH-ERROR'
        } else {
            let item = queue[tag - 1]
            return (typeof item === 'string')? item : (item.name || item.term)
        }
    } else {
        return 'UNKNOWN-TAG-TYPE'
    }
}

function parseNormalTags(template) {
    template = template.map((tag) => {
        if (Array.isArray(tag) && tag.length === 1) {
            return [(typeof tag[0] === 'string')? tag[0].toLowerCase() : tag[0]]
        }
        return tag
    })
    template = template.map((tag) => {
        if (Array.isArray(tag) && tag.length === 1) {
            return parseTag(tag[0])
        } else if (typeof tag === 'string') {
            return tag
        } else {
            return 'UNKNOWN-ITEM-ERROR'
        }
    })
    return template
}

function parseInjectedTemplate(templateStr) {
    let template = JSON.parse(templateStr)
    if (JSON.stringify(template).toLowerCase().includes('["fact"]')) {
        template = injectSubFacts(template)
    }
    return template
}

function getParsedTemplate(isFact, injectedTemplate) {
    itemPrepared = false
    personPrepared = false
    
    let template = 'NO-FACT'
    try {
        if (typeof injectedTemplate === 'string') {
            template = parseInjectedTemplate(injectedTemplate)
        } else if (injectedTemplate) {
            return 'UNKNOWN-PARSE-ERROR'
        } else { // TODO override functions
            template = getNextTemplate()
        }
        template = parseObjects(template, isFact)
        template = parseLists(template)
        template = parseMacros(template)
        template = parseNormalTags(template)
        template = template.join('')
        template = `${template.charAt(0).toUpperCase()}${template.slice(1)}${
            isStringTerminated(template)? '' : '.'}`
    } catch (error) {
        return error
    }
    return template
}

module.exports = {
    generateFact: () => getParsedTemplate(true),
    generateLie: () => getParsedTemplate(false),
    parseFactTemplate: (template) => getParsedTemplate(true, template),
    parseLieTemplate: (template) => getParsedTemplate(false, template)
}
