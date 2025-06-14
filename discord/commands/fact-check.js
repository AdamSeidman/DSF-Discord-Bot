const logger = require("@adamseidman/logger")
const { parseFactTemplate, parseLieTemplate } = require("@facts/construction")

const NUM_EXAMPLES = 10

function parseInput(msg, params, template) {
    let print = (x) => msg.reply(x)
    if (params.injected) {
        print = (x) => msg.channel.send(x)
    }
    template = template.trim()
    if (template.length < 1 || !template.startsWith('[') || !template.endsWith(']')) {
        print('You need to send a fact template.')
        return
    }
    logger.info('Received new fact template.', template)
    const facts = []
    const lies = []
    for (let i = 0; i < NUM_EXAMPLES; i++) {
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
            print(out.join(''))
            print = (x) => msg.channel.send(x)
            out = []
        }
        out.push(builder.shift())
    }
    print(out.join(''))
}

module.exports = {
    response: (msg, params) => {
        let template = ''
        if (params.injected) {
            template = params.params.join(' ')
        } else {
            template = msg.options.getString('template') || ''
        }
        parseInput(msg, params, template)
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
