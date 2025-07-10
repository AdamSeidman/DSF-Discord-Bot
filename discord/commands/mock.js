const Imgflip = require("../../apis/imgflip")
const { MessageFlags } = require("discord.js")
const { getMessageByUrl } = require("../modules/helpers")

const MOCKING_TEMPLATE_ID = '102156234'

function toMockingText(str) {
    return [...str].reduce((out, letter, idx) => {
        if (idx % 2 === 0) {
            letter = letter.toLowerCase()
        } else {
            letter = letter.toUpperCase()
        }
        return out + letter
    }, '"') + '"'
}

module.exports = {
    response: async (msg, params) => {
        if (params.isDM) {
            return msg.reply('This function isn\'t available in DMs.\nBesides, why would you want to mock yourself?')
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
                    if (originalMessage.author?.id == global.bot?.id) {
                        if (!params.injected) {
                            await msg.followUp('No.')
                            msg.reply = (x) => msg.channel.send(x)
                            msg.author = { username: msg.member?.user?.username }
                            params.injected = true
                        }
                        originalMessage = msg
                        originalMessage.mockedPhrase = 'I Tried To Get The Bot To Mock Itself'
                    } else {
                        originalMessage.mockedPhrase = toMockingText(originalMessage.content.trim())
                    }
                    attachment = await Imgflip.getMeme(originalMessage.mockedPhrase,
                        () => originalMessage.author.username, MOCKING_TEMPLATE_ID)
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
    },
    altMsg: 'Display help menu with available commands.'
}
