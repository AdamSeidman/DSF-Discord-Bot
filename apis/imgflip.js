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
            .then(({ data }) => {
                const template = randomArrayItem(data?.memes || [])
                resolve({
                    templateId: template.id,
                    boxCount: template.box_count
                })
            })
            .catch(reject)
    })
}

function getMeme(mainCaption, extraCaptionFn, template) {
    logger.debug('Attempting to generate custom meme.',{ mainCaption, template })
    if (!enabled) {
        return Promise.reject('Imgflip API not enabled.')
    } else if (typeof mainCaption !== 'string' || mainCaption.trim().length < 1) {
        return Promise.reject('No Caption Provided.')
    }
    if (typeof extraCaptionFn !== 'function') {
        extraCaptionFn = () => 'Bottom Text'
    }
    return new Promise((resolve, reject) => {
        let getTemplate = getRandomTemplate
        if (typeof template === 'string') {
            getTemplate = async () => {
                return { templateId: template, boxCount: 1 }
            }
        }
        const boxes = [mainCaption]
        getTemplate()
            .then(({ templateId, boxCount }) => {
                let count = 0
                while (boxes.length < Math.min(boxCount, 10)) {
                    boxes.push(extraCaptionFn(count++, boxCount))
                }
                return fetch(`${BASE_URL}/caption_image?template_id=${templateId
                    }&username=${process.env.IMGFLIP_USERNAME}&password=${process.env.IMGFLIP_PASSWORD
                    }&${boxes.map((caption, idx) => `boxes[${idx}][text]=${caption}`).join('&')}`)
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
