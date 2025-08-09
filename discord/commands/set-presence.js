const storage = require("node-persist")
const logger = require("@adamseidman/logger")
const { PresenceUpdateStatus, ActivityType } = require("discord.js")

async function setPresence(msg) {
    let presence = {
        activities: [],
        status: msg.options.getString('status') || PresenceUpdateStatus.Online
    }
    const activity = {
        name: msg.options.getString('activity')?.trim(),
        type: msg.options.getInteger('activity-type') ?? ActivityType.Custom
    }
    if (typeof activity.name === 'string' && activity.name.length > 0) {
        presence.activities.push(activity)
    }
    logger.log(`Setting bot presence to (Status: ${presence.status}) (Activities: [${
        presence.activities.map(x => x.name).join(', ')}])`, presence)
    await global.bot.setPresence(presence)
    await storage.setItem('presence', presence)
}

module.exports = {
    response: async (msg, params) => {
        if (params.injected) return
        
        if (params.user.id == global.owner.id) {
            await msg.reply('Setting presence...')
            try {
                await setPresence(msg)
            } catch (error) {
                logger.error('Error setting bot presence!', error)
            }
        } else {
            await msg.reply('You are not the bot owner.')
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
                    { name: 'Do Not Disturb', value: PresenceUpdateStatus.DoNotDisturb },
                    { name: 'Offline', value: PresenceUpdateStatus.Invisible }
                )
                .setRequired(false)
        )
        builder.addStringOption((option) => 
            option
                .setName('activity')
                .setDescription('Activity String')
                .setRequired(false)
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
                .setRequired(false)
        )
    },
    isTesterCommand: true,
    altMsg: 'Set bot presence. (Bot Owner Only)'
}
