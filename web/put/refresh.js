const logger = require("@adamseidman/logger")

async function handle(req) {
    logger.info('Forcing DB refresh...') // TODO
    return 202
}

module.exports = handle
