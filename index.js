require('dotenv').config()

const app = () => {
    require('./utils/logger').init()
    const db = require('./db/database')
    require('./web/server')
    require('./discord/client').init()
    db.init()
}

app()
