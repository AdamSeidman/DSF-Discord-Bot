const MAX_RAND = 98

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
    if (str === undefined || str.length === 0) return ''
    str = str.split('%20')
    if (str.length === 1) {
        return str[0]
    }
    let output = str[0]
    str.slice(1).forEach(x => output += ` ${x}`)
    return output
}

module.exports = {
    randomNumber: randomNumber,
    randomArrayItem: randomArrayItem,
    getRandomString: getRandomString,
    stripPunctuation: stripPunctuation,
    fixPathCharacters: fixPathCharacters
}