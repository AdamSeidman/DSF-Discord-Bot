const items = require('./items')
const people = require('./people')
const places = require('./places')
const acronym = require('./acronyms')
const { Table } = require('../database')
const { copyObject, randomArrayItem, randomNumber, shuffleArray } = require('../../utils/utils')

const tagTable = new Table('dynamicTags')
const factTable = new Table('factTemplates')

const usePrefix = 'use'
const preparePrefix = 'prepare'
const usageTerm = 'usage'
const itemTypes = ['blank', 'item', 'food', 'inedible', 'animal']
const personTypes = ['alive', 'dead', 'person', 'male', 'female']

let getFactWords = () => []
setTimeout(() => {
    const { generateFact } = require('../../fact/construction')
    getFactWords = () => {
        let arr = []
        for (let i = 0; i < 5; i++) {
            arr = [...arr, ...generateFact().split(' ')]
        }
        return arr
    }
}, 0)

const tagDictionary = {
    acronym: acronym.getAcronym,
    alive: () => people.getNextPerson({ alive: true }),
    animal: () => items.getNextItem({ alive: true }),
    blank: () => items.getNextItem(),
    dead: () => people.getNextPerson({ alive: false }),
    fact: () => facts.getRandom(true),
    female: () => people.getNextPerson({ male: false }),
    food: () => items.getNextItem({ food: true }),
    gibberish: () => shuffleArray(getFactWords()).slice(0, randomNumber(8) + 3).join(' '),
    inedible: () => items.getNextItem({ food: false }),
    item: () => items.getNextItem({ alive: false }),
    male: () => people.getNextPerson({ male: true }),
    person: () => people.getNextPerson(),
    place: places.getNextPlace,
}

tagDictionary.noun = () => {
    console.log(54321) // TODO put back to single line
    const ret = tagDictionary[randomArrayItem(['person', 'place', 'blank'])]().name
    return ret // TODO
}
tagDictionary.number = () => `${randomNumber()}`

function getRandomDbTemplate(cantRecurse=false) {
    let data = factTable.data
    if (cantRecurse) {
        data = data.filter(x => x.can_recurse)
    }
    return JSON.parse(randomArrayItem(data.map(x => x.template)))
}

function getTemplate(params) {
    const isLie = params?.lie || false
    let template = params?.template || getRandomDbTemplate()
    if (!Array.isArray(template)) {
        try {
            template = JSON.parse(template)
        } catch {
            return ['Could not parse template.']
        }
    }
    const parse = (arr) => {
        return arr.flatMap((part) => {
            if (part?.truth || part?.lie) {
                part = isLie? part.lie : part.truth
            } else if (part?.low || part?.high) {
                part = `${randomNumber(part.high - part.low) + part.low}`
            }
            if (!Array.isArray(part) || typeof part[0] !== 'string') {
                return [part]
            } else if (part.length !== 1) {
                return [randomArrayItem(part)]
            }
            let tag = part[0].trim().toLowerCase()
            if (tag === 'fact') {
                return parse(getRandomDbTemplate(true))
            } else if (tag.startsWith(usePrefix)) {
                tag = tag.slice(usePrefix.length)
                return [[`${preparePrefix}${tag}`], ['usage'], ' ', [tag]]
            }
            return [[tag]]
        })
    }
    return parse(template)
}

function getFactTemplate() {
    return copyObject(getTemplate())
}

function getLieTemplate() {
    return copyObject(getTemplate({ lie: true }))
}

function getParseableTemplates(templateStr, num=10) {
    if (typeof templateStr !== 'string') return
    const results = {
        facts: [],
        lies: []
    }
    let template = null
    for (let i = 0; i < num; i++) {
        try {
            template = getTemplate({ template: templateStr })
        } catch (err) {
            template = err
        }
        results.facts.push(template)
        try {
            template = getTemplate({ template: templateStr, lie: true })
        } catch (err) {
            template = err
        }
        results.lies.push(template)
    }
    return results
}

function refresh() {
    tagTable.refresh()
    factTable.refresh()
}

module.exports = {
    refresh,
    itemTypes,
    personTypes,
    getFactTemplate,
    getLieTemplate,
    getParseableTemplates,
    preparePrefix,
    usageTerm,
    tagDictionary
}
