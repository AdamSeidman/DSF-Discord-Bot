const OpenAI = require("openai")
const logger = require("@adamseidman/logger")
const { postpone, processHasArgument } = require("logic-kit")

const POLL_INTERVAL_MSEC = 2500

let openai = null
const assistantId = process.env.OPENAI_ASSISTANT_ID
let enabled = (typeof assistantId === 'string') && (typeof process.env.OPENAI_API_KEY === 'string')

if (enabled && processHasArgument('disable-ai')) {
    logger.debug('Requested turning AI off in debug mode.')
    enabled = false
} else if (enabled) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    if (!openai) {
        enabled = false
        logger.warn('Failed making OpenAI object.')
    }
} else {
    logger.warn('OpenAI not enabled!')
}

let pollingInterval = undefined
let tryNext = () => {}

function isEnabled() {
    return enabled
}

async function createThread() {
    const thread = await openai.beta.threads.create()
    return thread
}

async function addMessage(threadId, message) {
    const response = await openai.beta.threads.messages.create(
        threadId, {
            role: 'user',
            content: message
        }
    )
    return { response, threadId }
}

async function runAssistant(threadId) {
    const response = await openai.beta.threads.runs.create(
        threadId,
        { assistant_id: assistantId }
    )
    return { response, threadId }
}

async function checkingStatus(resolve, threadId, runId) {
    const runObject = await openai.beta.threads.runs.retrieve(threadId, runId)

    const status = runObject.status
    if (status == 'completed') {
        clearInterval(pollingInterval)

        const messagesList = await openai.beta.threads.messages.list(threadId)
        let messages = []

        messagesList.body.data.forEach((message) => {
            messages.push(message.content)
        })

        resolve(messages[0][0].text.value)
        postpone(tryNext)
    } else if (status == 'failed') {
        clearInterval(pollingInterval)

        resolve('OpenAI rejected this request.')
        postpone(tryNext)
    }
}

function createMessageThread(subject, nextFn, resolve, reject) {
    if (typeof nextFn === 'function') {
        tryNext = nextFn
    }
    createThread()
        .then((thread) => addMessage(thread.id, subject))
        .then((message) => runAssistant(message.threadId))
        .then((run) => {
            const runId = run.response.id
            pollingInterval = setInterval(() => {
                checkingStatus(resolve, run.threadId, runId)
            }, POLL_INTERVAL_MSEC)
        })
        .catch(reject)
}

module.exports = {
    createMessageThread,
    isEnabled
}
