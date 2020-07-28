const cp = require('child_process')

const MAX_RAND = 98

var openSQLiteDatabase = function () {
    console.log('Opening SQLite Studio')
    cp.execFile(`${__dirname}\\..\\scripts\\open_sqlite_studio.bat`, (err) => {
        if (err) {
            console.log(err)
        }
    })
}

var restartApp = function () {
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

var getRandomString = function (defaultCallback) {
    if(randomNumber(1500) === 420) {
        return 'Hitler did nothing wrong.'
    } else if (randomNumber(900) === 69) {
        return 'Fact machine broken.'
    } else {
        return defaultCallback()
    }
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

module.exports = {
    restartApp: restartApp,
    randomNumber: randomNumber,
    randomArrayItem: randomArrayItem,
    getRandomString: getRandomString,
    stripPunctuation: stripPunctuation,
    fixPathCharacters: fixPathCharacters,
    openSQLiteDatabase: openSQLiteDatabase
}