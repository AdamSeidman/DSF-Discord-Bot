const app = () => {
    require('dotenv').config()
    require('./utils/logger').init('DSF Bot', 'dsf_')
    const db = require('./db/database')
    require('./web/server')
    require('./discord/client').init()
    db.init()
}

try {
    app()
} catch (error) {
    console.error('Error initializing DSF!', error)
    process.exit(1)
}
