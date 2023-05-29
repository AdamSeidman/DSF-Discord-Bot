/**
 * Author: Adam Seidman
 * 
 * Provides Several utility functions used throughout the project.
 * 
 * Exports:
 *     HTTPheaders-
 *         Dict. of HTTP headers used in requests
 *     restartApp-
 *         Closes app. Batch script handles restarting (for web UI)
 *     copyObject-
 *         Copy js object in memory to new object
 *     randomNumber-
 *         Produces random number (max param)
 *     randomArrayItem-
 *         Given an array as input, it will chose a random item as output
 *     stripPunctuation-
 *         Removes any punctuation characters from provided input string
 *     fixPathCharacters-
 *         Parses URLs for HTTP requests
 *     openSQLiteDatabase-
 *         Runs the batch script that opens the sqlite desktop application
 */
const exitVoiceChannels = require('./voice').endAll

const MAX_RAND = 98

const headers = { // For requests
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'DELETE, POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With',
    'sec-fetch-mode': 'no-cors'
}

// Close app and end HTTP request for it
var restartApp = function (cmd, response) {
    exitVoiceChannels()
    if (response !== undefined) {
        response.writeHead(200, headers)
        response.end()
    }
    process.exit()
}

var randomNumber = function (max) {
    if (max === undefined) {
        max = MAX_RAND
    }
    return Math.ceil(Math.random() * max) + 1
}

var randomArrayItem = function (arr) {
    if (arr === undefined || arr.length <= 1) {
        return undefined
    }
    return arr[Math.floor(Math.random() * arr.length)]
}

var probabilityCheck = function(probability) {
    return Math.random() <= probability
}

var stripPunctuation = function (str) {
    /* eslint-disable-next-line */ // Thinks certain escape characters are unnecessary (they are not)
    return str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,'').replace(/\s{2,}/g,' ')
}

// Fixes path characters in HTTP requests
var fixPathCharacters = function (str) {
    let returnStr = ''
    while (str.length > 0) {
        if (str[0] === '%') {
            returnStr += String.fromCharCode(parseInt(str.slice(1, 3), 16))
            str = str.slice(3)
        } else {
            returnStr += str[0]
            str = str.slice(1)
        }
    }
    return returnStr
}

var copyObject = function (obj) {
    return JSON.parse(JSON.stringify(obj))
}

module.exports = {
    HTTPheaders: headers,
    restartApp: restartApp,
    copyObject: copyObject,
    randomNumber: randomNumber,
    randomArrayItem: randomArrayItem,
    probabilityCheck: probabilityCheck,
    stripPunctuation: stripPunctuation,
    fixPathCharacters: fixPathCharacters
}