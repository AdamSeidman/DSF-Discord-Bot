const { addItem, refreshItems, addPerson, addAdjective, addFact, getWebFormattedData } = require('../db/handlers/random-items')
const { setBotOnline, setOverrideMessage } = require('./override')
const { openSQLiteDatabase, restartApp } = require('../base/utils')

module.exports = {
    localEndpoints: [
        {path: 'adjective', action: addAdjective},
        {path: 'fact', action: cmd => addFact(...cmd.split('_'))},
        {path: 'override-message', action: setOverrideMessage},
        {path: 'bot-online', action: setBotOnline},
        {path: 'open-external-db', action: openSQLiteDatabase},
        {path: 'restart-app', action: restartApp}
    ],
    remoteEndpoints: [],
    sharedEndpoints: [
        {path: 'refresh', action: refreshItems},
        {path: 'person', action: cmd => addPerson(...cmd.split('_'))},
        {path: 'item', action: cmd => addItem(...cmd.split('_'))},
        {path: 'data', action: getWebFormattedData}
    ]
}