/**
 * Author: Adam Seidman
 * 
 * Connects functions from different files to endpoints used in UI
 */

const { addItem, refreshItems, addPerson, addAdjective, addFact, 
    getWebFormattedData, addPlace, addStaticFact } = require('../db/handlers/random-items')
const { setBotOnline, setOverrideMessage } = require('./override')
const { restartApp } = require('poop-sock')
const { refreshTerms } = require('../db/handlers/dsf-terms')
const { sendImmediateMessage } = require('../base/messages')

const refresh = function () {
    // Combine into single refresh function
    refreshItems()
    refreshTerms()
}

// Spaces are sent as underscores in HTTP requests
module.exports = {
    endpoints: [
        {path: 'adjective', action: addAdjective},
        {path: 'fact', action: cmd => {
            let arr = cmd.split('_')
            while (arr.length > 2) {
                // Keep underscores in main fact
                let el = arr.shift()
                arr[0] = `${el}_${arr[0]}`
            }
            addFact(...cmd.split('_'))}
        },
        {path: 'override-message', action: setOverrideMessage},
        {path: 'bot-online', action: setBotOnline},
        {path: 'restart-app', action: restartApp},
        {path: 'refresh', action: refresh},
        {path: 'person', action: cmd => addPerson(...cmd.split('_'))},
        {path: 'item', action: cmd => addItem(...cmd.split('_'))},
        {path: 'data', action: getWebFormattedData},
        {path: 'place', action: addPlace},
        {path: 'static-fact', action: addStaticFact},
        {path: 'immediate-message', action: cmd => sendImmediateMessage(...cmd.split('_'))}
    ]
}