const Discord = require("discord.js")
const { getStats } = require("@tables/stats")
const { matchesDiscordId } = require("logic-kit")

async function getUserById(id) {
    const client = require("discord")
    if (!id || typeof client.users?.fetch !== 'function') return
    const user = await client.users.fetch(id)
    return user
}

module.exports = {
    response: async (msg, params) => {
        let user = {
            id: params.user.id,
            username: params.user.username || params.user.user.username,
            avatar: params.user.displayAvatarURL()
        }
        let args = null
        if (!params.injected) {
            args = msg.options.getUser('person')
        } else if (params.params?.length > 0) {
            const id = matchesDiscordId(params.params[0])
            if (id) {
                user = await getUserById(id)
                if (user.bot) {
                    args = user
                } else if (user) {
                    user.avatar = user.displayAvatarURL()
                }
            }
            if (!id || !user) {
                msg.reply(`Could not find user: ${params.params[0]}`)
            }
        }
        if (args !== null) {
            if (args.bot) {
                msg.reply({
                    content: 'Cannot get statistics for a bot!',
                    flags: Discord.MessageFlags.Ephemeral
                })
                return
            }
            user.id = args.id
            user.username = args.username
            user.avatar = args.displayAvatarURL()
        }
        const stats = getStats(user.id) || {}
        const fields = Object.entries({
            fact: 'Facts',
            lie: 'Lies',
            prius: 'Priuses',
            effect: 'Effects',
            acronym: 'Acronyms',
            meme: 'Memes'
        }).map(([key, title]) => {
            return {
                name: Discord.bold(title),
                value: `${stats[key] || 0}`,
                inline: true
            }
        })
        msg.reply({
            embeds: [new Discord.EmbedBuilder()
                .setColor('#34EB3A')
                .setTitle('User Stats')
                .setAuthor({ name: user.username, iconURL: user.avatar })
                .addFields(...fields)
            ]
        })
    },
    argModifier: (builder) => {
        builder.addUserOption((option) => 
            option
                .setName('person')
                .setDescription('User to get stats of')
                .setRequired(false)
        )
    },
    helpMsg: 'Lists your daily stupid fact statistics.'
}
