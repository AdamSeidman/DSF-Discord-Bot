const { copyObject } = require("logic-kit")
const Imgflip = require("../../apis/imgflip")
const { MessageFlags } = require("discord.js")
const { getMessageByUrl } = require("../modules/helpers")

const DEFAULT_TEMPLATE = 'Spongebob'

const to = {
    message: (msg) => msg.content.trim(),
    quoted: (msg) => `"${msg.content.trim()}"`,
    username: (msg) => msg.author.username,
    nothing: () => '',
    mocked: (msg) => {
        return [...(msg.content.trim())].reduce((out, letter, idx) => {
            if (idx % 2 === 0) {
                letter = letter.toLowerCase()
            } else {
                letter = letter.toUpperCase()
            }
            return out + letter
        }, '"') + '"'
    }
}

const templateMap = {
    'Batman': {
        id: '438680',
        caption1: to.message,
        caption2: () => 'Please Stop Talking'
    },
    'Book': {
        id: '237236273',
        caption1: to.quoted,
        caption2: (msg) => `If ${to.username(msg)} didn't speak`
    },
    'Brick Wall': {
        id: '44618107',
        caption1: to.message,
        caption2: to.username
    },
    'Change My Mind': {
        id: '129242436',
        caption1: to.message,
        caption2: to.username
    },
    'Dominos': {
        id: '162372564',
        caption1: (msg) => `${to.username(msg)} saying "${to.message(msg)}"`,
        caption2: (msg) => `${to.username(msg)} being born`
    },
    'Kid Laughing': {
        id: '136840273',
        caption1: to.quoted,
        caption2: to.nothing
    },
    'Salary': {
        id: '389270386',
        caption1: to.nothing,
        caption2: (msg) => `${to.username(msg)}, why they said "${to.message(msg)}"`
    },
    'Spongebob': {
        id: '102156234',
        caption1: to.mocked,
        caption2: to.username
    }
}

module.exports = {
    response: async (msg, params) => {
        if (params.isDM) {
            return msg.reply('This function isn\'t available in DMs... for obvious reasons...')
        } else if (!params.injected) {
            await msg.deferReply({ flags: MessageFlags.Ephemeral })
        }
        let url = null
        let error = null
        if (params.injected) {
            if (params.params.length < 1) {
                error = 'You must provide a valid message URL.'
            }
            url = params.params[0]
        } else {
            url = msg.options.getString('message')
        }
        let attachment = null
        let originalMessage = null
        if (typeof error !== 'string') {
            if (typeof url !== 'string') {
                error = 'You must provide a valid argument for this command.'
            } else {
                if (!url.includes('/')) {
                    url = `${msg.channel.id}/${url}`
                }
                originalMessage = await getMessageByUrl(url, msg.guild?.id)
                if (typeof originalMessage?.content !== 'string') {
                    error = 'Could not find specified message by URL or ID.'
                } else if (originalMessage.content.trim().length < 3) {
                    error = 'The message is not long enough to mock.'
                } else {
                    const template = copyObject((!params.injected && templateMap[msg.options.getString('meme')])
                        || templateMap[DEFAULT_TEMPLATE])
                    if (originalMessage.author?.id == global.bot?.id) {
                        if (!params.injected) {
                            await msg.followUp('No.')
                            msg.reply = (x) => msg.channel.send(x)
                            msg.author = { username: msg.member?.user?.username }
                            params.injected = true
                        }
                        originalMessage = msg
                        template.id = templateMap[DEFAULT_TEMPLATE].id
                        template.caption1 = () => 'I Tried To Get The Bot To Mock Itself'
                        template.caption2 = (msg) => templateMap[DEFAULT_TEMPLATE].caption2(msg)
                    }
                    attachment = await Imgflip.getMeme(template.caption1(originalMessage),
                        () => template.caption2(originalMessage), template.id)
                }
            }
        }
        if (!attachment && typeof error !== 'string') {
            error = 'Could not generate mocking meme.'
        }
        if (typeof error === 'string') {
            if (params.injected) {
                return msg.reply(error)
            } else {
                return msg.followUp({ content: error })
            }
        } else if (!params.injected) {
            await msg.followUp({ content: 'Sending...' })
        }
        return originalMessage.reply({ files: [{ attachment }] })
    },
    argModifier: (builder) => {
        builder.addStringOption((option) => 
            option
                .setName('message')
                .setDescription('Message URL or ID to mock.')
                .setRequired(true)
        )
        builder.addStringOption((option) =>
            option
                .setName('meme')
                .setDescription('Pick a set meme template')
                .setChoices(...Object.keys(templateMap).map(name => {
                    return { name, value: name }
                }))
                .setRequired(false)
        )
    },
    altMsg: 'Reply with a mocking meme to a specified message.'
}
