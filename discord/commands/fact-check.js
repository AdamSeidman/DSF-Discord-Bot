module.exports = { // TODO
    response: (msg, params) => {
        if (params.isTestingGuild) {
            // TODO
        } else if (!params.injected) {
            msg.reply({content: 'Unknown Error.', ephemeral: true})
        }
    },
    argModifier: (builder) => {
        builder.addStringOption((option) => 
            option
                .setName('template')
                .setDescription('Fact template to check.')
                .setRequired(true)
        )
    },
    isTesterCommand: true
}
