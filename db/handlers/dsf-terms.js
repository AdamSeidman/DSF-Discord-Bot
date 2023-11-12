/**
 * Author: Adam Seidman
 * 
 * Provides different terms to create DSF acronyms
 * 
 * Exports:
 *     refreshTerms: Check .db and run setup routine again
 *     getAdverbs: Returns list of 'D' adverbs
 *     getAdjectives: Returns list of 'S' adjectives
 *     getNouns: Returns list of 'F' nouns
 */

const db = require('../db')
const config = require('../../client/config')

var terms = {
    adverbs: [],
    adjectives: [],
    nouns: []
}

// Delete terms and re-initialize from database
var refresh = function () {
    console.log('Terms Refresh Requested.')
    terms = {
        adverbs: [],
        adjectives: [],
        nouns: []
    }
    setup()
}

// Get list of terms from given category
var getArray = function (arr) {
    if (!config.options.hasAcronyms) return []
    setup()
    return terms[arr] || []
}

// Read in database and store information
var setup = function () {
    if (!config.options.hasAcronyms) return
    if (terms.adverbs.length === 0) {
        db.setUpDatabases()
        let dsfTerms = db.getDatabase('dsfTerms')
        if (!dsfTerms) {
            // Database empty
            console.log('Error: No DSF terms.')
            console.log(dsfTerms)
        } else {
            // Store data
            dsfTerms.forEach('Adverbs', row => {
                terms.adverbs.push(row.word)
            })

            dsfTerms.forEach('Adjectives', row => {
                terms.adjectives.push(row.word)
            })

            dsfTerms.forEach('Nouns', row => {
                terms.nouns.push(row.word)
            })

            console.log('DSF Terms Setup Complete.')
            dsfTerms.close()
        }
    }
}

module.exports = {
    getAdverbs: () => getArray('adverbs'),
    getAdjectives: () => getArray('adjectives'),
    getNouns: () => getArray('nouns'),
    refreshTerms: refresh
}