const FormData = require('form-data')
const storage = require("node-persist")
const { copyObject } = require('logic-kit')
const logger = require("@adamseidman/logger")

// TODO remove
require("dotenv").config()
logger.init('test', 'test_', 'yellow', null)
process.DEBUG = true
// end remove

const BASE_URL = `https://${process.DEBUG? 'test' : ''
    }raildata.njtransit.com/api/TrainData`
const TOKEN_STORAGE_KEY = 'NJT_TOKEN' + (process.DEBUG? 'DEBUG' : 'PROD')

let enabled = (typeof process.env.NJTRANSIT_USERNAME === 'string'
    && typeof process.env.NJTRANSIT_PASSWORD === 'string')
if (!enabled) {
    logger.warn('NJ Transit API not enabled! Will not retrieve rail data.')
}

let token = null

function isEnabled() {
    return enabled
}

function njtRequest(ep, params={}) {
    if (typeof ep !== 'string') {
        throw new Error('No endpoint specified.')
    }
    const form = new FormData()
    Object.entries(params).forEach(([key, obj]) => form.append(key, obj))
    if (!params.token && !params.username) {
        form.append('token', `${token}`)
    }
    return fetch(`${BASE_URL}/${ep}`, {
        method: 'POST',
        headers: {
            'accept': 'text/plain',
            'Content-Type': form.getHeaders()['content-type'],
            'Content-Length': form.getLengthSync()
        },
        body: form.getBuffer()
    })
}

async function isTokenValid() {
    let res = await njtRequest('isValidToken')
    if (res.status !== 200) {
        logger.error('Bad status when checking token validity!', res.status)
        return null
    }
    res = await res.json()
    return res?.validToken
}

async function getToken() {
    let res = await njtRequest('getToken', {
        username: process.env.NJTRANSIT_USERNAME,
        password: process.env.NJTRANSIT_PASSWORD
    })
    if (res.status !== 200) {
        return ''
    }
    try {
        res = await res.json()
    } catch {
        return ''
    }
    return res.UserToken
}

async function checkToken() {
    if (token === null) {
        token = await storage.getItem(TOKEN_STORAGE_KEY)
    }
    if (!token) {
        token = await getToken()
    }
    let valid = await isTokenValid()
    let count = 0
    while (typeof valid === 'boolean' && !valid && ++count < 3) {
        token = await getToken()
        valid = await isTokenValid()
    }
    if (!valid) {
        token = ''
        logger.error('Could not get token.', valid)
        throw new Error('Could not get token!')
    }
    await storage.setItem(TOKEN_STORAGE_KEY, token)
}

async function isInited() {
    if (!enabled) {
        return false
    }
    try {
        await checkToken()
    } catch (error) {
        logger.error('Could not get/check token!', error)
        return false
    }
    if (typeof token === 'string' && token.trim().length > 1) {
        return true
    }
    return false
}

let stationList = []
async function getStationList(forceRefresh=false) {
    if (!await isInited()) {
        return null
    }
    if (stationList.length < 1 || forceRefresh) {
        let res = await njtRequest('getStationList')
        if (res.status === 200) {
            try {
                res = await res.json()
            } catch {
                return null
            }
            if (Array.isArray(res) && res.length > 0) {
                stationList = res
            } else {
                logger.warn('Received bad data from /getStationList', res)
            }
        } else {
            logger.warn('Received bad status from /getStationList', res.status)
        }
    }
    if (stationList?.length < 1) {
        logger.warn('Returning no station data in getStationList')
    }
    return copyObject(stationList)
}

async function getStationSchedule(stationCode, njtOnly=false) {
    if (typeof stationCode !== 'string' || stationCode.length !== 2) {
        throw new Error('Invalid station code provided: ' + stationCode)
    }
    if (!await isInited()) {
        return null
    }
    let res = await njtRequest('getStationSchedule', {
        station: stationCode,
        NJTOnly: njtOnly
    })
    try {
        res = await res.json()
    } catch {
        return null
    }
    return res
}

// TODO remove
async function test() {
    await require("node-persist").init()

    console.log(await isInited())
    console.log('===============')

    // console.log(await getStationList())
    console.log(await getStationSchedule('MU')) // Metuchen
}
test()

module.exports = {
    isEnabled,
    getStationList
}
