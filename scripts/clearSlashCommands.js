require("module-alias/register")
require("dotenv").config()
const { postpone } = require("logic-kit")
const logger = require("@adamseidman/logger")

const app = async () => {
    console.log('Running application...')
    global.DEBUG = true
    global.clearSlashCommands = true
    await require("node-persist").init()
    require("tmp").setGracefulCleanup()
    global.dsf = require("../config.json")
    logger.init('Clearing Slash Commands', 'dsfClear_', 'red', null)
    const db = require("../db/database")
    const discord = require("discord")
    db.init()
    await discord.init()
}

async function waitForCompletion() {
    let count = 0
    while (!global.owner) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        if (++count > 1000) {
            logger.fatal('Bot never logged in!')
            process.exit(1)
        }
    }
    postpone(async () => {
        logger.info('Closing...\r\n')
        await require("discord").close()
        process.exit(0)
    })
}

if (require.main === module) {
    try {
        app()
        waitForCompletion()
    } catch (error) {
        console.error('Error with clear script!', error)
        process.exit(1)
    }
}
