const scheduler = require('./scheduling-handler')

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

var setupDailyChannel = function (msg) {
    scheduler.addDailyChannel(msg.channel)
}

var commandArray = [
    {phrase: 'delete', response: deleteFunction},
    {phrase: 'daily', response: setupDailyChannel}
]

module.exports = {
    commands: commandArray
}