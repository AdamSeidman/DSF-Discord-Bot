const fs = require("fs")
const cors = require("cors")
const path = require("path")
const helmet = require("helmet")
const express = require("express")
const passport = require("passport")
const users = require("@tables/users")
const bodyParser = require("body-parser")
const session = require("express-session")
const logger = require("@adamseidman/logger")
const RateLimit = require("express-rate-limit")
const userSessions = require("@tables/sessions")
const DiscordStrategy = require("passport-discord").Strategy

let app = express()

const rateLimiter = RateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    handler: (req, res) => {
        logger.warn(`Rate limit exceeded by IP: ${req.ip} path: ${req.path}`)
        res.status(429).json({ message: 'Too Many Requests' })
    }
})

app.use(helmet({ contentSecurityPolicy: false }))
app.use(rateLimiter)
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

app.set('trust proxy', !global.DEBUG)

app.use(passport.initialize())
app.use(passport.session())

passport.use(new DiscordStrategy({
    clientID: process.env.OAUTH_DISCORD_CLIENT_ID || '|',
    clientSecret: process.env.OAUTH_DISCORD_CLIENT_SECRET || '',
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
    } else if ((req.path.endsWith('.html') || !req.path.includes('.')) && !req.isAuthenticated()
         && !(['/privacy', '/tos', '/generator', '/factCheck'].find(x => req.path.startsWith(x)))) {
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
app.use('/.well-known/security.txt', express.static(path.join(__dirname, 'public/security.txt')))

const epHandlers = {}
;['get', 'post', 'put'].forEach((verb) => {
    fs.readdirSync(path.join(__dirname, verb)).forEach((file) => {
        if (path.extname(file) === '.js') {
            const handle = `./${verb}/${file.slice(0, file.indexOf('.'))}`
            epHandlers[handle] = require(handle)
        }
    })
})
app.use('/api/:ep', jsonParser, async (req, res, next) => {
    const handle = `./${req.method.toLowerCase()}/${req.params?.ep || ''}`
    if (Object.prototype.hasOwnProperty.call(epHandlers, handle) && typeof epHandlers[handle] === 'function') {
        let ret = await epHandlers[handle](req, res)
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
    if (global.DEBUG) {
        logger.warn('Incoming 404', `${req.method} ${req.url}`)
    }
    res.status(404).sendFile(path.join(__dirname, 'public/404.html'))
})

const PORT = (global.DEBUG? process.env.EXPRESS_PORT_ALT : process.env.EXPRESS_PORT) || 80
app.listen(PORT, () => {
    logger.debug(`Express server listening on port ${PORT}`)
})
