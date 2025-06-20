require("module-alias/register")
require("dotenv").config()
const logger = require("@adamseidman/logger")

const app = async () => {
    console.log('Running application...')
    global.DEBUG = true
    global.clearSlashCommands = true
    await require("node-persist").init()
    global.dsf = require("../config.json")
    logger.init('Clearing Slash Commands', 'dsfClear_', 'red', null)
    const db = require("../db/database")
    const discord = require("discord")
    db.init()
    await discord.init()
}

if (require.main === module) {
    try {
        app()
        setTimeout(async () => {
            logger.info('Closing...\r\n')
            await require("discord").close()
            process.exit(0)
        }, 5000)
    } catch (error) {
        console.error('Error with clear script!', error)
        process.exit(1)
    }
}
