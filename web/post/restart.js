const { postpone } = require("logic-kit")
const { execSync } = require("child_process")
const logger = require("@adamseidman/logger")
const users = require("../../db/tables/users")

async function handle(req) {
    const user = users.get(req.user?.id)
    if (!user) {
        return { code: 401 }
    }
    if (!user.can_restart_bot) {
        return { code: 403 }
    }
    await require("../../discord/client").close()
    logger.info('Restarting from POST...', req.query.reason || '(no query reason)')
    console.log('\n')
    postpone(() => {
        if (!global.DEBUG && !global.dsf.disableGitPull) {
            console.log('Pulling latest from git...')
            try {
                execSync('git pull', { stdio: 'inherit' })
                console.log('Git pull complete.\n')
            } catch (error) {
                console.error(`Git pull failed: ${error.message}\n`)
            }
        }
        process.kill(process.pid, 'SIGINT')
    })
    return 202
}

module.exports = handle
