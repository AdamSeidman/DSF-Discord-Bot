const logger = require("@adamseidman/logger")
const { randomArrayItem } = require("logic-kit")

const BASE_URL = 'https://api.imgflip.com'

let enabled = (typeof process.env.IMGFLIP_USERNAME === 'string'
    && typeof process.env.IMGFLIP_PASSWORD === 'string')
if (!enabled) {
    logger.warn('Imgflip API not enabled! Cannot generated memes.')
}

function isEnabled() {
    return enabled
}

function getRandomTemplate() {
    return new Promise((resolve, reject) => {
        fetch(`${BASE_URL}/get_memes`)
            .then(x => x.json())
            .then(({ data }) => randomArrayItem(data?.memes || [])?.id)
            .then(resolve)
            .catch(reject)
    })
}

function getMeme(caption1, caption2, template) {
    logger.debug('Attempting to generate custom meme.',{ caption1, caption2, template })
    if (!enabled) {
        return Promise.reject('Imgflip API not enabled.')
    } else if (typeof caption1 !== 'string' || caption1.trim().length < 1) {
        return Promise.reject('No Caption Provided.')
    }
    if (typeof caption2 !== 'string' || caption2.trim().length < 1) {
        caption2 = null
    }
    return new Promise((resolve, reject) => {
        let getTemplate = getRandomTemplate
        if (typeof template === 'string') {
            getTemplate = async () => template
        } else if (typeof template === 'function') {
            getTemplate = async () => await template() 
        }
        getTemplate()
            .then((templateId) => {
                return fetch(`${BASE_URL}/caption_image?template_id=${templateId
                    }&username=${process.env.IMGFLIP_USERNAME}&password=${process.env.IMGFLIP_PASSWORD
                    }&text0=${caption1}${caption2? `&text1=${caption2}` : ''}`)
            })
            .then(x => x.json())
            .then(({ data }) => {
                logger.info('New meme generated.', data?.url)
                resolve(data.url)
            })
            .catch(reject)
    })
}

module.exports = {
    isEnabled,
    getMeme
}
