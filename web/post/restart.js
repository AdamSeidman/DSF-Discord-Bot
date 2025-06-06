const { postpone } = require("logic-kit")
const logger = require('@adamseidman/logger')

async function handle(req) {
    await require("../../discord/client").close()
    logger.info('Restarting from POST...', req.query.reason || '(no query reason)')
    console.log('\n')
    postpone(() => process.kill(process.pid, 'SIGINT'))
    return 200
}

module.exports = handle
