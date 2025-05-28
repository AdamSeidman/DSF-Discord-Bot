module.exports = { // TODO
    response: (msg) => {},
    argModifier: (builder) => {
        builder.addBooleanOption((option) =>
            option
                .setName('enabled')
                .setDescription('Set whether effects can be triggered by chat messages.')
                .setRequired(true)
        )
    },
    helpMsg: 'Enables or disables sound effects on the server.',
    isSlashCommand: true
}
