const { addItem, refreshItems, addPerson } = require('../db/handlers/random-items')

module.exports = {
    list: [
        {path: 'refresh', action: () => refreshItems()},
        {path: 'person', action: cmd => addPerson(...cmd.split('_'))},
        {path: 'item', action: cmd => addItem(...cmd.split('_'))}
    ]
}