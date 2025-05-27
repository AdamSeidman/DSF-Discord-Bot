require('dotenv').config()

const app = () => {
    require('./utils/logger').init('DSF Bot', 'dsf_')
    const db = require('./db/database')
    require('./web/server')
    require('./discord/client').init()
    db.init()
}

app()
