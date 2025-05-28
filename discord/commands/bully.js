module.exports = { // TODO
    response: (msg, params) => {},
    argModifier: (builder) => {
        builder.addUserOption((option) =>
            option
                .setName('bully-target')
                .setDescription('User to make fun of.')
                .setRequired(true)
        )
    },
    helpMsg: 'Bully your friends!',
    isSlashCommand: true
}
