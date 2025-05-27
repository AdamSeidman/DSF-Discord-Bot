const { Bucket } = require('../database')
const logger = require('../../utils/logger')
const { randomArrayItem } = require('../../utils/utils')
const { createAudioResource } = require('@discordjs/voice')

const bucket = new Bucket('effects')

function getEffect(name) {
    name = name.trim().toLowerCase()
    if (!Object.keys(bucket.data).includes(name)) return

    try {
        const { data } = bucket.client.storage.from(bucket.name).getPublicUrl(name)
        if (data?.publicUrl) {
            return createAudioResource(data.publicUrl)
        }
    } catch (error) {
        logger.warn(`Error loading effect (${name})`, error)
    }
}

function getList() {
    return Object.keys(bucket.data)
}

function getRandomEffect() {
    return getEffect(randomArrayItem(getList()))
}

module.exports = {
    refresh: () => bucket.refresh(),
    getList,
    getEffect,
    getRandomEffect
}
