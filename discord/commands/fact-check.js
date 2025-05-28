module.exports = { // TODO
    response: (msg) => {},
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
