const Discord = require("discord.js")

const MAX_DELETIONS = 25

module.exports = {
    response: (msg, params) => {
        if (params.isDM || msg.member?.id != process.env.DISCORD_ADMIN_USER_ID) {
            if (!params.injected) {
                msg.reply({
                    content: 'Yeah',
                    flags: Discord.MessageFlags.Ephemeral
                })
            }
            return
        }
        let num = 0
        if (params.injected) {
            if (params.params.length < 1) {
                msg.reply('Delete command requires an argument.')
                return
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
            msg.reply(`Argument should be a number 1-${MAX_DELETIONS}.`)
        } else {
            if (!params.injected) {
                msg.reply({
                    content: 'Deleting...',
                    flags: Discord.MessageFlags.Ephemeral
                })
            }
            msg.channel.bulkDelete(num + 1)
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
