module.exports = { // TODO (params and such)
    response: (msg, params) => {
        if (params.isDM) {
            msg.reply('Command not available in DMs.')
        } else {
            // TODO setup
            if (params.injected) {
                msg.channel.send('msg') // TODO
            } else {
                msg.reply('msg')
            }
        }
    },
    argModifier: (builder) => {
        builder.addBooleanOption((option) =>
            option
                .setName('enabled')
                .setDescription('Set whether or not effects can be triggered by chat messages.')
                .setRequired(true)
        )
    },
    helpMsg: 'Enables or disables sound effects on the server.'
}
