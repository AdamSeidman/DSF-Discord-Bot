const db = require('../db')

var terms = {
    adverbs: ['daily', 'daily', 'daily'],
    adjectives: ['stupid', 'stupid', 'stupid'],
    nouns: ['facts', 'facts', 'facts']
}

var refresh = function () {
    console.log('Terms Refresh Requested.')
    terms = {
        adverbs: [],
        adjectives: [],
        nouns: []
    }
    setup()
}

var getArray = function (arr) {
    return terms[arr] || []
}

var setup = function () {
    if (terms.adverbs.length === 0) {
        db.setUpDatabases()
        let dsfTerms = db.getDatabase('dsfTerms')
        if (!dsfTerms) {
            console.log('Error: No DSF terms.')
            console.log(dsfTerms)
        } else {
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