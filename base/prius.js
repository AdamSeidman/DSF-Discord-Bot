/**
 * Author: Adam Seidman
 * 
 * Posts random prius pics to discord channel
 * 
 * Exports:
 *     postPriusPic: posts prius picture
 *         Param: msg- discord message requestion prius pic
 * 
 * If you still don't know what this file does, I don't know what to tell you...
 */

const fs = require('fs') // Need prius pictures from /assets/prius // TODO cache?
const { randomNumber } = require('./utils')

const dir = './assets/prius'
let count = -1
fs.readdir(dir, (err, files) => {
    count += files.length // Store number of prius pictures on startup
})

var postPriusPic = function (msg) {
    // Send random prius picture back to channel
    msg.channel.send('Ya like jazz?', {
        files: [`${ dir }/prius (${ randomNumber(count) }).jpg`]
    })
}

module.exports = {
    postPriusPic: postPriusPic
}