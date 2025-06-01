const fs = require("fs")
const cors = require("cors")
const path = require("path")
const helmet = require("helmet")
const express = require("express")
const bodyParser = require("body-parser")
const logger = require("@adamseidman/logger")

let app = express()
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors())

// Body parser setup
let jsonParser = bodyParser.json()
app.use(express.urlencoded({ extended: true }))

// Static items
app.use(express.static(path.join(__dirname, 'public')))

// Dynamic routes (API endpoints)
const epHandlers = {}
;['get', 'post'].forEach((verb) => {
    fs.readdirSync(path.join(__dirname, verb)).forEach((file) => {
        if (path.extname(file) === '.js') {
            const handle = `./${verb}/${file.slice(0, file.indexOf('.'))}`
            epHandlers[handle] = require(handle)
        }
    })
})
app.use('/api/:ep', jsonParser, (req, res, next) => {
    const handle = `./${req.method.toLowerCase()}/${req.params?.ep || ''}`
    if (epHandlers[handle]) {
        let ret = epHandlers[handle](req, res)
        if (typeof ret === 'number') {
            res.status(ret).json({})
        } else if (ret) {
            let code = ret.code
            if (typeof code !== 'number') {
                code = 200
            }
            res.status(code).json(ret)
        }
    } else {
        next()
    }
})

// Not Found handling catch-all
app.use((req, res) => {
    logger.warn('Incoming 404', `${req.method} ${req.url}`)
    res.status(404).sendFile(path.join(__dirname, 'public/404.html'))
})

// Server setup
const PORT = process.env.EXPRESS_PORT || 80 // TODO config
app.listen(PORT, () => {
    logger.debug(`Express server listening on port ${PORT}`)
})
