const Discord = require("discord.js")
const logger = require("@adamseidman/logger")
const { matchesDiscordId, randomEmojis, isStringTerminated,
    randomNumber } = require("logic-kit")
const { getRandomInsult } = require("@tables/insults")

async function getUserById(id) {
    const { client } = require("../client")
    if (!id || typeof client.users?.fetch !== 'function') return
    const user = await client.users.fetch(id)
    return user
}

module.exports = {
    response: async (msg, params) => {
        let success = false
        let message = ''
        let extraMessage = ''
        if (!params.injected) {
            params.params = [Discord.userMention(msg.options?.getUser('bully-target')?.id)]
            const extra = (msg.options?.getString('message') || '').trim()
            if (extra.length > 0) {
                params.params = [params.params[0], ...extra.split(' ')]
            }
        }

        if (params.params.length < 1) {
            message = 'You must provide a valid user to bully!'
        } else if (matchesDiscordId(params.params[0])) {
            success = true
            if (params.params.length > 1) {
                extraMessage = params.params.slice(1).join(' ').trim()
            }
        } else {
            message = 'The provided argument was invalid!'
        }
        
        if (success) {
            const user = await getUserById(matchesDiscordId(params.params[0]))
            if (!user) {
                success = false
                message = 'Could not find a user to bully!'
            } else if (user.bot) {
                success = false
                message = 'You cannot bully a bot!'
            } else {
                const insult = `${Discord.userMention(params.user.id)} told me that you ${getRandomInsult() || 'INSULT_ERROR'}.${
                    (extraMessage.length > 0)? ` Also they said "${
                        Discord.bold(extraMessage)}"${isStringTerminated(extraMessage)? '' : '.'
                    }` : ''
                }`
                user.send(insult)
                logger.info(`Bully message sent to ${user.username || user.id}`, insult)
            }
        }

        if (params.injected) {
            randomEmojis(randomNumber(2, 5)).forEach(x => msg.react(x))
            if (!success && message.length > 0) {
                msg.reply(message)
            }
        } else {
            msg.reply({
                content: success? 'Sending...' : message,
                flags: Discord.MessageFlags.Ephemeral
            })
        }
    },
    argModifier: (builder) => {
        builder.addUserOption((option) =>
            option
                .setName('bully-target')
                .setDescription('User to make fun of.')
                .setRequired(true)
        ).addStringOption((option) =>
            option
                .setName('message')
                .setDescription('Extra message to give your friend.')
                .setRequired(false)
        )
    },
    helpMsg: 'Bully your friends!'
}
