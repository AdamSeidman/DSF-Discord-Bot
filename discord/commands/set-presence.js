const fs = require("fs")
const path = require("path")
const logger = require("@adamseidman/logger")
const { PresenceUpdateStatus, ActivityType } = require("discord.js")

async function setPresence(msg) {
    const presence = {
        activities: [{
            name: msg.options.getString('activity'),
            type: msg.options.getInteger('activity-type')
        }],
        status: msg.options.getString('status')
    }
    logger.log(`Setting bot presence to (${presence.status}) (${
        presence.activities.map(x => x.name).join(', ')})`, presence)
    await process.bot.setPresence(presence)
    fs.writeFileSync(path.join(__dirname, '../presence.json'), JSON.stringify(presence))
}

module.exports = {
    response: async (msg, params) => {
        if (params.injected) {
            return
        }
        if (params.user.id == process.owner?.id) {
            msg.reply('Setting presence...')
            try {
                await setPresence(msg)
            } catch (error) {
                logger.error('Error setting bot presence!', error)
            }
        } else {
            msg.reply('You are not the bot owner.')
        }
    },
    argModifier: (builder) => {
        builder.addStringOption((option) =>
            option
                .setName('status')
                .setDescription('Online Status')
                .setChoices(
                    { name: 'Online', value: PresenceUpdateStatus.Online },
                    { name: 'Idle', value: PresenceUpdateStatus.Idle },
                    { name: 'DoNotDisturb', value: PresenceUpdateStatus.DoNotDisturb },
                    { name: 'Invisible', value: PresenceUpdateStatus.Invisible }
                )
                .setRequired(true)
        )
        builder.addIntegerOption((option) =>
            option
                .setName('activity-type')
                .setDescription('Activity Type')
                .setChoices(
                    { name: 'Custom', value: ActivityType.Custom },
                    { name: 'Playing', value: ActivityType.Playing },
                    { name: 'Streaming', value: ActivityType.Streaming },
                    { name: 'Listening', value: ActivityType.Listening },
                    { name: 'Watching', value: ActivityType.Watching },
                    { name: 'Competing', value: ActivityType.Competing }
                )
                .setRequired(true)
        )
        builder.addStringOption((option) => 
            option
                .setName('activity')
                .setDescription('Activity String')
                .setRequired(true)
        )
    },
    isTesterCommand: true,
    altMsg: 'Set bot presence. (Bot Owner Only)'
}
