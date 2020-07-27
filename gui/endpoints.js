const { addItem, refreshItems, addPerson, addAdjective } = require('../db/handlers/random-items')

module.exports = {
    list: [
        {path: 'refresh', action: () => refreshItems()},
        {path: 'person', action: cmd => addPerson(...cmd.split('_'))},
        {path: 'item', action: cmd => addItem(...cmd.split('_'))},
        {path: 'adjective', action: cmd => addAdjective(cmd)}
    ]
}