const app = () => {
    require('dotenv').config()
    require('./utils/logger').init('DSF Bot', 'dsf_')
    const db = require('./db/database')
    require('./web/server')
    const discord = require('./discord/client')
    process.on('SIGINT', async () => {
        console.log('\nSIGINT: Shutting down...\n')
        await discord.close()
        process.exit(0)
    })
    discord.init()
    db.init()
}

try {
    app()
} catch (error) {
    console.error('Error initializing DSF!', error)
    process.exit(1)
}
