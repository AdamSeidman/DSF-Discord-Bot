const OpenAI = require("../apis/openai")

const requests = []
let resolving = false

function tryNext() {
    const next = requests.shift()
    if (next === undefined) {
        resolving = false
    } else {
        resolving = true
        OpenAI.createMessageThread('fact', tryNext, next.resolve, next.reject)
    }
}

function getAiFact() {
    return new Promise((resolve, reject) => {
        requests.push({ resolve, reject })
        if (!resolving) {
            tryNext()
        }
    })
}

module.exports = { getAiFact }
