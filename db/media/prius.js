const { Bucket } = require("../database")
const logger = require("@adamseidman/logger")
const { randomArrayItem } = require("logic-kit")

const bucket = new Bucket('prius')

function getRandomImage() {
    const imageName = randomArrayItem(Object.keys(bucket.data))
    if (!imageName) return
    try {
        const { data } = bucket.client.storage.from(bucket.name).getPublicUrl(imageName)
        return `${data?.publicUrl}.jpg`
    } catch (error) {
        logger.warn(`Error loading prius.`, error)
    }
}

module.exports = {
    refresh: () => bucket.refresh(),
    getRandomImage
}
