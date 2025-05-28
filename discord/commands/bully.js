module.exports = { // TODO (params and such)
    response: (msg, params) => {
        const success = false // TODO try
        if (params.injected) {
            if (!success) {
                msg.reply('Could not bully your friend :(') // TODO add args
            }
        } else {
            msg.reply({
                content: success? 'Sending...' : 'Could not send message!',
                ephemeral: true
            })
        }
    },
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
