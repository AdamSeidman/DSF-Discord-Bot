require("module-alias/register")
require("dotenv").config()
const { postpone } = require("logic-kit")
const logger = require("@adamseidman/logger")

const WAIT_TIME = 2000

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

function pruneSessions() {
    const sessions = require("@tables/sessions")
    const nonExpired = { expired: false }
    let count = 0
    let ran = false
    sessions.getAll()
        .map((session) => {
            let data = {}
            try {
                data = JSON.parse(session.data)
            } catch {
                return nonExpired
            }
            if (!data.cookie?.expires) {
                return nonExpired
            } else if (typeof data.cookie.expires === 'string') {
                data.cookie.expires = new Date(data.cookie.expires)
            }
            session.expired = (data.cookie.expires < Date.now())
            return session
        })
        .filter(x => x.expired)
        .map(x => x.session_id)
        .forEach((session, _, arr) => {
            ran = true
            sessions.destroy(session, () => {
                if (++count >= arr.length) {
                    logger.info('Pruned expired sessions!\n')
                    postpone(() => { process.exit(0) })
                }
            })
        })
    if (!ran) {
        logger.warn('Nothing to prune!\n')
        postpone(() => { process.exit(0) })
    }
}

if (require.main === module) {
    try {
        app()
        setTimeout(() => {
            pruneSessions()
        }, WAIT_TIME)
    } catch (error) {
        console.error('Error with session script!', error)
        process.exit(1)
    }
}
