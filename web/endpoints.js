/**
 * Author: Adam Seidman
 * 
 * Connects functions from different files to endpoints used in UI
 */

const { addItem, refreshItems, addPerson, addAdjective, addFact, getWebFormattedData } = require('../db/handlers/random-items')
const { setBotOnline, setOverrideMessage } = require('./override')
const { openSQLiteDatabase, restartApp } = require('../base/utils')
const { refreshTerms } = require('../db/handlers/dsf-terms')

const refresh = function () {
    // Combine into single refresh function
    refreshItems()
    refreshTerms()
}

// Spaces are sent as underscores in HTTP requests
module.exports = {
    endpoints: [
        {path: 'adjective', action: addAdjective},
        {path: 'fact', action: cmd => addFact(...cmd.split('_'))},
        {path: 'override-message', action: setOverrideMessage},
        {path: 'bot-online', action: setBotOnline},
        {path: 'open-external-db', action: openSQLiteDatabase},
        {path: 'restart-app', action: restartApp},
        {path: 'refresh', action: refresh},
        {path: 'person', action: cmd => addPerson(...cmd.split('_'))},
        {path: 'item', action: cmd => addItem(...cmd.split('_'))},
        {path: 'data', action: getWebFormattedData}
    ]
}