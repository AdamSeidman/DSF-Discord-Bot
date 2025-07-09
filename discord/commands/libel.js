const Discord = require("discord.js")
const { matchesDiscordId } = require("logic-kit") // TODO Redo npm installation for logic-kit
const { getRandomInsult } = require("@tables/insults")
const { getUserById } = require("discord/modules/helpers")

module.exports = {
    response: async (msg, params) => {
        let error = null
        let user = null
        if (params.injected) {
            if (params.params.length < 1) {
                error = 'You must provide a user!'
            } else if (!matchesDiscordId(params.params[0])) {
                error = 'The provided argument was invalid!'
            }
        } else {
            params.params = [Discord.userMention(msg.options?.getUser('bully-target')?.id)]
        }
        if (typeof error !== 'string') {
            try {
                user = await getUserById(matchesDiscordId(params.params[0]))
            } catch {}
            if (!user) {
                error = 'Could not find specified user!'
            }
        }
        if (error) {
            await msg.reply({
                content: error,
                flags: Discord.MessageFlags.Ephemeral
            })
        } else {
            if (!params.injected) {
                await msg.reply({
                    content: 'Sending...',
                    flags: Discord.MessageFlags.Ephemeral
                })
            }
            await msg.channel.send(`Hey ${params.params[0]}!\n${Discord.userMention(params.user.id)
                } told me that you ${getRandomInsult() || 'INSULT_ERROR'}.`)
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
    helpMsg: 'Send libelous messages about your friends!'
}
