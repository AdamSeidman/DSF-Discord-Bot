const path = require("path")
const { Bucket } = require("../database")
const logger = require("@adamseidman/logger")
const { randomArrayItem } = require("logic-kit")
const { createAudioResource } = require("@discordjs/voice")

const tempDir = global.pruning? {} : require("tmp").dirSync({ unsafeCleanup: true })
logger.debug(`Temporary directory for voice effects: ${tempDir.name}`, tempDir)
const bucket = new Bucket('effects', refresh)

function getEffect(name) {
    name = name?.trim().toLowerCase()
    if (!Object.keys(bucket.data).includes(name)) return

    try {
        return createAudioResource(path.join(tempDir.name, `${name}.mp3`))
    } catch (error) {
        logger.warn(`Error loading effect (${name})`, error)
    }
}

function getList() {
    return Object.keys(bucket.data)
}

function getRandomEffect() {
    return getEffect(randomArrayItem(getList()) || (getList()[0]))
}

function refresh() {
    if (tempDir.name && global.allowMedia) {
        bucket.downloadToDir(tempDir.name)
    }
}

module.exports = {
    refresh,
    getList,
    getEffect,
    getRandomEffect
}
