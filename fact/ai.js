const OpenAI = require('openai') // TODO Does running multiple of these at once cause a crash?
// require('dotenv').config() // TODO refactor functions a little

const POLL_INTERVAL_MSEC = 2500

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})
const assistantId = process.env.OPENAI_ASSISTANT_ID
let pollingInterval = undefined

const createThread = async () => {
    const thread = await openai.beta.threads.create()
    return thread
}

const addMessage = async (threadId, message) => {
    const response = await openai.beta.threads.messages.create(
        threadId,
        {
            role: 'user',
            content: message
        }
    )
    return { response, threadId }
}

const runAssistant = async (threadId) => {
    const response = await openai.beta.threads.runs.create(
        threadId,
        { assistant_id: assistantId }
    )
    return {response, threadId}
}

const checkingStatus = async (resolve, threadId, runId) => {
    const runObject = await openai.beta.threads.runs.retrieve(
        threadId,
        runId
    )

    const status = runObject.status
    if (status == 'completed') {
        clearInterval(pollingInterval)

        const messagesList = await openai.beta.threads.messages.list(threadId)
        let messages = []

        messagesList.body.data.forEach(message => {
            messages.push(message.content)
        })

        resolve(messages[0][0].text.value)
    }
}

const getAiFact = async () => {
    return new Promise((resolve) => {
        createThread()
            .then((thread) => {
                return addMessage(thread.id, 'fact')
            })
            .then((message) => {
                return runAssistant(message.threadId)
            })
            .then((run) => {
                const runId = run.response.id
                pollingInterval = setInterval(() => {
                    checkingStatus(resolve, run.threadId, runId)
                }, POLL_INTERVAL_MSEC)
            })
    })
}

module.exports = {
    getAiFact
}
