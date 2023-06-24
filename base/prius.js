/**
 * Author: Adam Seidman
 * 
 * Posts random prius pics to discord channel
 * 
 * Exports:
 *     postPriusPic: posts prius picture
 *         Param: msg- discord message requesting prius pic
 * 
 * If you still don't know what this file does, I don't know what to tell you...
 */

const fs = require('fs') // Need prius pictures from /assets/prius
const { randomNumber } = require('./utils')

const dir = './assets/prius'
let count = -1
fs.readdir(dir, (err, files) => {
    count += files.length // Store number of prius pictures on startup
})

var postPriusPic = function (msg) {
    // Send random prius picture back to channel
    let content = {content: 'Ya like jazz?', files: [{attachment: `${ dir }/prius (${ randomNumber(count) }).jpg`}]}
    if (msg.author) {
        msg.channel.send(content)
    } else {
        msg.reply(content)
    }
}

module.exports = {
    postPriusPic: postPriusPic
}