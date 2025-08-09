const { MessageFlags } = require("discord.js")

const MAX_DELETIONS = 25

module.exports = {
    response: (msg, params) => {
        if (params.isDM || msg.member?.id != global.owner.id) {
            if (!params.injected) {
                return msg.reply({
                    content: 'Yeah',
                    flags: MessageFlags.Ephemeral
                })
            }
            return
        }
        let num = 0
        if (params.injected) {
            if (params.params.length < 1) {
                return msg.reply('Delete command requires an argument.')
            }
            try {
                num = parseInt(params.params[0])
            } catch {
                num = 0
            }
        } else {
            num = msg.options?.getInteger('messages') || 0
        }
        if (num < 1 || num > MAX_DELETIONS) {
            return msg.reply(`Argument should be a number 1-${MAX_DELETIONS}.`)
        } else {
            if (!params.injected) {
                msg.reply({
                    content: 'Deleting...',
                    flags: MessageFlags.Ephemeral
                })
            }
            return msg.channel.bulkDelete(num + 1)
        }
    },
    argModifier: (builder) => {
        builder.addIntegerOption((option) => 
            option
                .setName('messages')
                .setDescription('Number of items')
                .setMinValue(1)
                .setMaxValue(MAX_DELETIONS)
                .setRequired(true)
        )
    },
    isTesterCommand: true,
    altMsg: 'Delete messages.'
}
