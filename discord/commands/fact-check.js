const logger = require("@adamseidman/logger")
const { parseFactTemplate, parseLieTemplate } = require("@facts/construction")

const NUM_EXAMPLES = 10

async function parseInput(msg, params, template) {
    let print = async (x) => await msg.reply(x)
    if (params.injected) {
        print = async (x) => await msg.channel.send(x)
    }
    template = template.trim()
    if (template.length < 1 || !template.startsWith('[') || !template.endsWith(']')) {
        await print('You need to send a fact template.')
        return
    }
    logger.info('Received new fact template.', template)
    const facts = []
    const lies = []
    for (let _ of new Array(NUM_EXAMPLES)) {
        facts.push(parseFactTemplate(template))
        lies.push(parseLieTemplate(template))
    }
    let builder = [
        `Provided template:\n> ${template}\n\nTen sample facts:\n`,
        ...facts.map(x => `> ${x}\n`),
        '\nTen sample lies:\n',
        ...lies.map(x => `> ${x}\n`)
    ]
    let out = []
    while (builder.length > 0) {
        if (out.join('').concat(builder[0]).length >= 2000) {
            await print(out.join(''))
            print = async (x) => await msg.channel.send(x)
            out = []
        }
        out.push(builder.shift())
    }
    await print(out.join(''))
}

module.exports = {
    response: (msg, params) => {
        let template = ''
        if (params.injected) {
            template = params.params.join(' ')
        } else {
            template = msg.options.getString('template') || ''
        }
        return parseInput(msg, params, template)
    },
    argModifier: (builder) => {
        builder.addStringOption((option) => 
            option
                .setName('template')
                .setDescription('Fact template to check.')
                .setRequired(true)
        )
    },
    isTesterCommand: true,
    altMsg: 'Check a fact template.',
    parseInput
}
