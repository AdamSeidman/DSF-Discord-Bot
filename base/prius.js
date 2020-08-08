const fs = require('fs')
const { randomNumber } = require('./utils')

const dir = './assets/prius'
let count = -1
fs.readdir(dir, (err, files) => {
    count += files.length
})

var postPriusPic = function (msg) {
    msg.channel.send('Ya like jazz?', {
        files: [`./assets/prius/prius (${ randomNumber(count) }).jpg`]
    })
}

module.exports = {
    postPriusPic: postPriusPic
}