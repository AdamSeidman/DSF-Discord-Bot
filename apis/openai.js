const OpenAI = require("openai")
const { postpone } = require("logic-kit")

const POLL_INTERVAL_MSEC = 2500

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const assistantId = process.env.OPENAI_ASSISTANT_ID
let pollingInterval = undefined
let tryNext = () => {}

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

module.exports = { createMessageThread }
