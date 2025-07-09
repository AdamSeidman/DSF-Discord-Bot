require("module-alias/register")
require("dotenv").config()
const { postpone } = require("logic-kit")
const logger = require("@adamseidman/logger")

const app = () => {
    console.log('Running application...')
    global.DEBUG = true
    logger.init('Pruning Expired Sessions', 'sessionPrune_', 'red', null)
    const db = require("../db/database")
    db.init()
    process.on('SIGINT', () => {
        console.log('\nSIGINT: Shutting down...\n')
        process.exit(0)
    })
}

async function pruneSessions() {
    const sessions = require("@tables/sessions")
    let count = 0
    while (sessions.getAll().length < 1) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        if (++count > 1000) {
            logger.fatal('Never retrieved sessions from database!')
            process.exit(1)
        }
    }
    count = 0
    let promises = sessions.getAll()
        .reduce((out, session, idx, arr) => {
            if (idx === 0) {
                logger.info(`There are ${arr.length} total session(s).`)
            }
            try {
                const data = JSON.parse(session.data)
                if (typeof data.cookie?.expires !== 'string') {
                    throw null
                }
                if (new Date(data.cookie.expires) < Date.now()) {
                    out.push({ ...session, poolSize: arr.length })
                }
            } catch {}
            return out
        }, [])
        .map((session, idx, arr) => {
            return () => {
                return sessions.destroy(session.session_id, () => {
                    console.log(`Destroyed session ${idx + 1} of ${arr.length}`)
                    if (++count >= arr.length) {
                        logger.info(`Pruned ${arr.length} expired session(s) from a pool of ${session.poolSize}\n`)
                        postpone(process.exit, [0])
                    }
                })
            }
        })
    if (promises.length < 1) {
        logger.warn('Nothing to prune!\n')
        postpone(process.exit, [0])
    } else {
        for (const fn of promises) {
            await fn()
        }
    }
}

if (require.main === module) {
    try {
        app()
        pruneSessions()
    } catch (error) {
        console.error('Error with session script!', error)
        process.exit(1)
    }
}
