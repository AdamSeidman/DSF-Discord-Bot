const items = require("@tables/items")
const facts = require("@tables/facts")
const override = require("./override")
const people = require("@tables/people")
const places = require("@tables/places")
const insults = require("@tables/insults")
const acronym = require("@tables/acronyms")
const logger = require("@adamseidman/logger")
const numConverter = require("number-to-words")
const dynamicTags = require("@tables/extraTags")
const { randomArrayItem, copyObject, randomNumber,
    shuffleArray, isStringTerminated } = require("logic-kit")

const FACT_CACHE_SIZE = 5

const usePrefix = 'use'
const preparePrefix = 'prepare'
const usageTerm = 'usage'
const itemTypes = ['blank', 'item', 'food', 'inedible', 'animal']
const personTypes = ['alive', 'dead', 'person', 'male', 'female']

let itemPrepared = false
let personPrepared = false
let lastTemplateIds = Array(FACT_CACHE_SIZE).fill(-1)
const queue = ['(N/a)']

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
    insult: () => insults.getRandomInsult(),
    item: () => items.getNextItem({ alive: false }),
    male: () => people.getNextPerson({ male: true }),
    number: () => `${randomNumber()}`,
    person: () => people.getNextPerson(),
    place: () => places.getNextPlace(),
}
tagDictionary.gibberish = () => {
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
            if (tag[0].toLowerCase().endsWith('noun')) {
                tag = randomArrayItem([['person'], ['place'], ['useblank']])
                if (!tag[0].startsWith(usePrefix)) {
                    out.push(tag)
                    return
                }
            }
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
                let num = randomNumber(tag.low, tag.high)
                switch (tag.param?.toUpperCase()) {
                    case 'WORDS':
                        num = numConverter.toWords(num)
                        break
                    case 'ORDINAL':
                        num = numConverter.toOrdinal(num)
                        break
                    case 'WORDSORDINAL':
                        num = numConverter.toWordsOrdinal(num)
                        break
                }
                return `${num}`
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
    if (tag.length < 1) {
        logger.error('Bad length error in parseStringTag!', tag)
        return 'BAD-TAG-LENGTH'
    }
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
            logger.warn('Unknown prepare tag in parseStringTag!', tag)
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
        if (tag !== 'number') {
            queue.unshift(term)
        }
        return term
    } else if (dynamicTags.getTagList().includes(tag)) {
        let term = dynamicTags.getRandomTagItem(tag)
        queue.unshift(term)
        return term
    } else {
        logger.warn('Unknown string tag!', tag)
        return 'UNKNOWN-STRING-TAG'
    }
}

function parseTag(tag) {
    if (typeof tag === 'string') {
        return parseStringTag(tag)
    } else if (typeof tag === 'number') {
        if (queue.length < tag) {
            logger.warn('Queue length error in parseTag', tag)
            return 'QUEUE-LENGTH-ERROR'
        } else {
            let item = queue[tag - 1]
            return (typeof item === 'string')? item : (item.name || item.term)
        }
    } else {
        logger.warn('Unknown tag type in parseTag.', tag)
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
            logger.warn(`Unknown item error in parseNormalTags (${tag})`, template)
            return 'UNKNOWN-ITEM-ERROR'
        }
    })
    return template
}

function preParseNormalTags(template, subject, requiredTag) {
    let hasPrep = false, wasPlural = false, numItems = 2, personActive = true
    const builder = []

    if (!personTypes.find(x => x.endsWith(requiredTag))) {
        personActive = false
    }

    const put = (fn) => {
        let item = template.shift()
        if (Array.isArray(item) && item[0] !== 'number') {
            const isNumber = typeof item[0] === 'number'
            builder.push(fn(item[0], isNumber, !!personTypes.find(x => x.endsWith(item[0])),
                !isNumber && item[0].endsWith('s'), !isNumber && item[0].startsWith(preparePrefix),
                !isNumber && (item[0].endsWith(requiredTag) || item[0].slice(0, -1).endsWith(requiredTag))))
        } else {
            builder.push(item)
        }
    } 

    let running = true
    while (template.length > 0 && running) {
        put((tag, isNumber, isPerson, isPlural, isPrepare, isMainTag) => {
            if (isMainTag) {
                running = false
                if (isPrepare) {
                    hasPrep = true
                    return ''
                } else {
                    wasPlural = isPlural
                    queue.unshift(subject.name)
                    return isPlural? subject.plural : subject.name
                }
            } else {
                return [tag]
            }
        })
    }
    running = true
    while (template.length > 0 && running) {
        put((tag, isNumber, isPerson, isPlural, isPrepare, isMainTag) => {
            if (isNumber) {
                if (hasPrep) {
                    return [tag]
                } else if (tag === 1) {
                    return wasPlural? subject.plural : subject.name
                } else {
                    return [tag - 1]
                }
            } else if (tag.toLowerCase() === 'usage') {
                return subject.usage
            } else if (isMainTag) {
                if (hasPrep) {
                    hasPrep = false
                    wasPlural = isPlural
                    queue.unshift(subject.name)
                    return isPlural? subject.plural : subject.name
                } else {
                    running = false
                    return [tag]
                }
            } else if (personActive && tag.includes('_')) {
                tag = tag.split('_')
                return subject.isMale? tag[0] : tag[1]
            } else {
                if (isPerson) {
                    personActive = false
                }
                running = false
                return [tag]
            }
        })
    }
    while (template.length > 0) {
        put((tag, isNumber, isPerson) => {
            if (isNumber) {
                if (tag === numItems) {
                    return wasPlural? subject.plural : subject.name
                } else {
                    return [tag]
                }
            } else if (personActive && tag.includes('_')) {
                tag = tag.split('_')
                return subject.isMale? tag[0] : tag[1]
            } else {
                if (isPerson) {
                    personActive = false
                }
                numItems++
                return [tag]
            }
        })
    }
    return builder
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
            logger.error('Unknown parse error!', injectedTemplate)
            return 'UNKNOWN-PARSE-ERROR'
        } else if (override.isOverridden()) {
            return `${isFact? '' : 'This is a lie: '}${override.getOverrideMessage()}`
        } else {
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
        if (typeof injectedTemplate !== 'string') {
            logger.warn('Error parsing template! ' + (injectedTemplate || template), error)
        }
        return error
    }
    return template
}

function findSpecificTemplate(item, isFact) {
    const result = {
        found: true,
        fact: '',
        alternateSubject: ''
    }
    const dictionary = {
        ...people.getDictionary(),
        ...places.getDictionary(),
        ...items.getDictionary()
    }
    let subject = dictionary[item]
    if (!subject) {
        subject = randomArrayItem(Object.values(dictionary))
        result.found = false
        result.alternateSubject = subject.plural || subject.name
    }
    let found = false
    let template = ''
    while (!found) {
        template = getNextTemplate()
        template = parseObjects(template, isFact)
        template = parseLists(template)
        template = parseMacros(template)
        template = JSON.stringify(template)
        found = subject.tags.find(x => template.includes(JSON.stringify([x])))
    }
    template = preParseNormalTags(JSON.parse(template), subject, found.toLowerCase())
    result.fact = getParsedTemplate(isFact, JSON.stringify(template))
    return result
}

module.exports = {
    generateFact: () => getParsedTemplate(true),
    generateLie: () => getParsedTemplate(false),
    parseFactTemplate: (template) => getParsedTemplate(true, template),
    parseLieTemplate: (template) => getParsedTemplate(false, template),
    findSpecificTemplate,
    getGibberish: tagDictionary.gibberish,
    tagList: Object.keys(tagDictionary),
    itemTypes
}
