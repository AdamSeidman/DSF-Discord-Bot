const { refreshItems } = require('../db/handlers/random-items')

module.exports = {
    list: [
        {path: 'refresh', action: () => refreshItems()}
    ]
}