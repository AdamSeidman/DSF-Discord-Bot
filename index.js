const app = () => {
    require("dotenv").config()
    process.dsf = require('./config.json')
    require("@adamseidman/logger").init('DSF Bot', 'dsf_', 'yellow')
    const db = require("./db/database")
    require("./web/server")
    const discord = require("./discord/client")
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
