const Discord = require("discord.js")
const logger = require("@adamseidman/logger")
const { submitRepick } = require("@tables/hosts")

module.exports = {
    response: async (msg, params) => {
        if (params.isDM) {
            await msg.reply('This command is not available in DMs!')
            return
        }
        const result = await submitRepick(params.user?.id, msg.guild)
        if (result.error) {
            await msg.reply({
                content: 'There was an error with this command!',
                flags: Discord.MessageFlags.Ephemeral
            })
            logger.error('Error running /repick', result.error)
        } else if (result.isHost) {
            await msg.reply('My friend, YOU are the host.\nYou are a god among men!\nWhy would you want to repick yourself?')
        } else if (result.repicked) {
            logger.info(`New host picked in ${msg.guild?.name}`, Discord.userMention(result.hostId))
            await msg.reply(`The repick vote has passed!\n${Discord.userMention(result.hostId)} is now the host.`)
        } else if (result.submitted) {
            await msg.reply(`There ${(result.votesLeft === 1)? 'is' : 'are'} ${result.votesLeft} more vote${
                (result.votesLeft === 1)? '' : 's'
            } needed in order to repick ${Discord.userMention(result.hostId)}.`)
        } else {
            await msg.reply(`You have already voted to repick ${Discord.userMention(result.hostId)
                }.\nDo you want them repicked that badly?`)
        }
    },
    helpMsg: 'Repicks host'
}
