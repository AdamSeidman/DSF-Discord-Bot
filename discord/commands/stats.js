module.exports = { // TODO
    response: (msg, params) => {},
    argModifier: (builder) => 
        builder.addUserOption((option) =>
            option
                .setName('person')
                .setDescription('User to get stats of')
                .setRequired(false)
    ),
    helpMsg: 'Lists your daily stupid fact statistics.',
    isSlashCommand: true
}
