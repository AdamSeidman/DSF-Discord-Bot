const cp = require('child_process')
const exitVoiceChannels = require('./voice').endAll

const MAX_RAND = 98

var openSQLiteDatabase = function () {
    console.log('Opening SQLite Studio')
    cp.execFile(`${__dirname}\\..\\scripts\\open_sqlite_studio.bat`, (err) => {
        if (err) {
            console.log(err)
        }
    })
}

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'DELETE, POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With',
    'sec-fetch-mode': 'no-cors'
}

var deleteFunction = function (msg, args) {
    if (args.length < 2) {
        msg.channel.send('Delete command requires an argument.')
    } else {
        const parsed = Number.parseInt(args[1])
        if (Number.isNaN(parsed) || parsed < 1 || parsed > 10) {
            msg.channel.send('Argument should be number from 1-10.')
            return
        }
        msg.channel.bulkDelete(parsed + 1)
    }
}

var restartApp = function (cmd, response) {
    exitVoiceChannels()
    response.writeHead(200, headers)
    response.end()
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

var stripPunctuation = function (str) {
    /* eslint-disable-next-line */
    return str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,'').replace(/\s{2,}/g,' ')
}

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
    deleteFunction: deleteFunction,
    randomArrayItem: randomArrayItem,
    stripPunctuation: stripPunctuation,
    fixPathCharacters: fixPathCharacters,
    openSQLiteDatabase: openSQLiteDatabase
}