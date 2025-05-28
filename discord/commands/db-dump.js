module.exports = { // TODO
    response: (msg, params) => {
        if (!params.injected) {
            msg.reply({ content: 'Working...', ephemeral: true })
        }
        msg.channel.send('(db)') // TODO send DB
    },
    altMsg: 'Shows all database items.',
    isSlashCommand: true
}
