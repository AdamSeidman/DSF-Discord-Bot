require("module-alias/register")
const { postpone } = require("logic-kit")

const app = async (config) => {
    require("dotenv").config()
    global.DEBUG = process.argv.slice(2).includes('--DEBUG')
    console.log('DEBUG =', global.DEBUG)
    require("./assets/loadBearingRaccoon").check()
    await require("node-persist").init()
    require("tmp").setGracefulCleanup()
    global.dsf = config || require("./config.json")
    require("@adamseidman/logger").init('DSF Bot', 'dsf_', 'yellow')
    require("./apis/imgflip")
    const db = require("./db/database")
    const discord = require("discord")
    if (!global.dsf.disableSIGINT) {
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
