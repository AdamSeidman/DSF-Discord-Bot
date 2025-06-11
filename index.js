const { postpone } = require("logic-kit")

const app = async (config) => {
    require("dotenv").config()
    process.DEBUG = process.argv.slice(2).includes('--DEBUG')
    console.log('DEBUG =', process.DEBUG)
    require("./assets/loadBearingRaccoon").check()
    await require('node-persist').init()
    process.dsf = config || require("./config.json")
    require("@adamseidman/logger").init('DSF Bot', 'dsf_', 'yellow')
    const db = require("./db/database")
    const discord = require("./discord/client")
    if (!process.dsf.disableSIGINT) {
        process.on('SIGINT', async () => {
            console.log('\nSIGINT: Shutting down...\n')
            await discord.close()
            process.exit(0)
        })
    }
    db.init()
    await discord.init()
    postpone(() => require("./web/server"))
}

if (require.main === module) {
    try {
        app()
    } catch (error) {
        console.error('Error initializing DSF!', error)
        process.exit(1)
    }
}

module.exports = { app }
