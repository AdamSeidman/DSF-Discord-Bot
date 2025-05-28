const chalk = require('chalk')
const figlet = require('figlet')
const logger = require('better-node-file-logger')

function getDate(removeAt) {
    let date = new Date().toLocaleString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: 'numeric', minute: 'numeric', hour12: true
    })
    if (!removeAt) {
        date = date.replace('at ', '')
    }
    return date
}

function log(logfn, text, bg='black', fg='white', obj, font) {
    if (typeof logfn != 'function') {
        console.error(getDate(), 'log.js: No valid logging function!')
        return
    }
    logfn(text, obj)
    if (typeof font === 'string') {
        text = figlet.textSync(text, { font }) || text
    } else {
        font = null
    }
    if (!chalk[fg] || !chalk[bg]) {
        console.error(getDate(), 'log.js: Invalid color requested!')
        return
    }
    bg = `bg${bg.charAt(0).toUpperCase()}${bg.slice(1)}`
    if (font) {
        text = chalk[fg][bg](text) || text
    } else {
        text = `${getDate()} | ${text}`
        if (typeof obj === 'string') {
            text += ` | ${obj}`
        }
        text = chalk[fg][bg](text) || text
    }
    if (fg.includes('red') || bg.includes('Red')) {
        console.error(text)
        if (obj) {
            console.error(obj)
        }
    } else {
        console.log(text)
    }
}

module.exports = {
    init: (message='STARTUP', prefix='log_') => {
        logger.quickInit(prefix, true)
        console.log('\r\n\r\n')
        log(logger.info, message, undefined, 'magenta', undefined, 'ANSI Shadow')       
        console.log('\r\n')
    },
    debug: (text, obj) => {
        return log(logger.debug, text, undefined, 'greenBright', obj)
    },
    trace: (text, obj) => {
        return log(logger.trace, text, 'white', 'blue', obj)
    },
    info: (text, obj) => {
        return log(logger.info, text, undefined, 'white', obj)
    },
    warn: (text, obj) => {
        return log(logger.warn, text, undefined, 'yellow', obj)
    },
    error: (text, obj) => {
        return log(logger.error, text, undefined, 'red', obj)
    },
    fatal: (text, obj) => {
        return log(logger.fatal, text, 'white', 'redBright', obj)
    },
    log: (text) => {
        return log(logger.info, text)
    },
    big: (text, fg='white') => {
        return log(logger.info, text, undefined, fg, undefined, 'small')
    }
}
