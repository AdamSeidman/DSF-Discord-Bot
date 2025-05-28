module.exports = { // TODO
    response: (msg, params) => {},
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
