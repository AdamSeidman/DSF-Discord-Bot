const { addItem, refreshItems, addPerson, addAdjective, addFact } = require('../db/handlers/random-items')
const { setBotOnline, setOverrideMessage } = require('./override')
const { openSQLiteDatabase, restartApp } = require('../base/utils')

module.exports = {
    localEndpoints: [
        {path: 'adjective', action: cmd => addAdjective(cmd)},
        {path: 'fact', action: cmd => addFact(...cmd.split('_'))},
        {path: 'override-message', action: cmd => setOverrideMessage(cmd)},
        {path: 'bot-online', action: cmd => setBotOnline(cmd)},
        {path: 'open-external-db', action: openSQLiteDatabase},
        {path: 'restart-app', action: (cmd, response) => restartApp(cmd, response)}
    ],
    remoteEndpoints: [],
    sharedEndpoints: [
        {path: 'refresh', action: () => refreshItems()},
        {path: 'person', action: cmd => addPerson(...cmd.split('_'))},
        {path: 'item', action: cmd => addItem(...cmd.split('_'))}
    ]
}