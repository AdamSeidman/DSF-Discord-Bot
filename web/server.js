const fs = require("fs")
const cors = require("cors")
const path = require("path")
const helmet = require("helmet")
const express = require("express")
const passport = require("passport")
const bodyParser = require("body-parser")
const session = require("express-session")
const users = require("../db/tables/users")
const logger = require("@adamseidman/logger")
const userSessions = require("../db/tables/sessions")
const DiscordStrategy = require("passport-discord").Strategy

let app = express()
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors())

let jsonParser = bodyParser.json()
app.use(express.urlencoded({ extended: true }))

const sessionOptions = {
    secret: process.env.OAUTH_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'Lax',
        maxAge: 1000 * 60 * 60 * 24 * 7
    },
    store: new userSessions.SessionStore()
}
app.use(session(sessionOptions))

app.set('trust proxy', true)

app.use(passport.initialize())
app.use(passport.session())

passport.use(new DiscordStrategy({
    clientID: process.env.OAUTH_DISCORD_CLIENT_ID,
    clientSecret: process.env.OAUTH_DISCORD_CLIENT_SECRET,
    callbackURL: '/auth/discord/callback',
    scope: ['identify', 'email', 'guilds']
}, async (accessToken, refreshToken, profile, done) => {
    const user = {
        id: profile.id,
        username: profile.username
    }
    const res = await users.login(user)
    if (res) return done(null, user)
    return done(null, false)
}))

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((obj, done) => done(null, obj))

app.get('/auth/discord', passport.authenticate('discord'))
app.get('/auth/discord/callback', passport.authenticate('discord', {
    successRedirect: '/',
    failureRedirect: '/login'
}))

app.use((req, res, next) => {
    if (req.path.startsWith('/login')) {
        if (req.isAuthenticated()) {
            return res.redirect('/')
        }
    } else if ((req.path.endsWith('.html') || !req.path.includes('.'))
        && !req.isAuthenticated()) {
            return req.logout(() => {
                res.redirect('/login')
            })
    }
    next()
})

app.get('/logout', (req, res) => {
    req.logout(() => {
        res.clearCookie('connect.sid')
        if (req.sessionID) {
            userSessions.destroy(req.sessionID)
        }
        res.status(200).redirect('/login')
    })
})

app.use(express.static(path.join(__dirname, 'public')))

const epHandlers = {}
;['get', 'post', 'put'].forEach((verb) => {
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
        let ret = epHandlers[handle](req, res) // TODO sub-handle?
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

app.use((req, res) => {
    logger.warn('Incoming 404', `${req.method} ${req.url}`) // TODO ?
    res.status(404).sendFile(path.join(__dirname, 'public/404.html'))
})

const PORT = (process.DEBUG? process.env.EXPRESS_PORT_ALT : process.env.EXPRESS_PORT) || 80
app.listen(PORT, () => {
    logger.debug(`Express server listening on port ${PORT}`)
})
