module.exports = { // TODO setup
    response: (msg, params) => {
        // TODO parse args
        if (params.isDM) {
            msg.reply('Cannot set up daily facts in DMs.')
        } else if (params.injected) {
            msg.reply('...')
        } else {
            msg.channel.send('...')
        }
    },
    helpMsg: 'Sets up/stop daily stupid facts in the channel.',
    isSlashCommand: true// TODO bool arg
}
