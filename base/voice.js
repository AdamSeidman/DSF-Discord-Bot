const fs = require('fs')

var servers = {}

var endAll = () => Object.keys(servers).forEach(x => logServer({guild: {id: x.slice(1)}}, false))

var logServer = function (msg, start, connection, dispatcher) {
    const ID = `#${msg.guild.id}`
    if (start) {
        if (servers[ID] !== undefined) {
            let item = servers[ID]
            item.connection = connection
            item.dispatcher = dispatcher
        } else {
            servers[ID] = {
                connection: connection,
                dispatcher: dispatcher
            }
        }
    } else {
        let item = servers[ID]
        item.dispatcher.destroy()
        item.connection.disconnect()
        delete servers[ID]
    }
}

var playMusic = async function (msg, song) {
    if (msg.member.voice.channel) {
        let connection = undefined
        await msg.member.voice.channel.join().then(response => {
            connection = response
        })

        const dispatcher = await connection.play(fs.createReadStream(`./assets/${song}.mp3`))
        logServer(msg, true, connection, dispatcher)

        dispatcher.on('finish', () => {
            logServer(msg, false)
        })
        
        dispatcher.on('error', console.error)
    } else {
        msg.channel.send('You aren\'t in a voice channel.')
    }
}

var playRepeatMusic = async function (msg, song) {
    if (msg.member.voice.channel) {
        let connection = undefined
        await msg.member.voice.channel.join().then(response => {
            connection = response
        })

        const dispatcher = await connection.play(fs.createReadStream(`./assets/${song}.mp3`))
        logServer(msg, true, connection, dispatcher)
        
        dispatcher.on('finish', () => {
            dispatcher.play(fs.createReadStream('./assets/music.mp3'))
        })
        
        dispatcher.on('error', console.error)
    } else {
        msg.channel.send('You aren\'t in a voice channel.')
    }
}

var endMusic = function (msg) {
    if (servers[`#${msg.guild.id}`] !== undefined) {
        logServer(msg, false)
    } else {
        msg.channel.send('No music is playing.')
    }
}

var pauseMusic = function (msg) {
    const ID = `#${msg.guild.id}`
    if (servers[ID] !== undefined) {
        servers[ID].dispatcher.pause()
    } else {
        msg.channel.send('No music is playing.')
    }
}

var resumeMusic = function (msg) {
    const ID = `#${msg.guild.id}`
    if (servers[ID] !== undefined) {
        servers[ID].dispatcher.resume()
    } else {
        msg.channel.send('There is no music that is paused.')
    }
}

module.exports = {
    playMusic: playMusic,
    playRepeatMusic: playRepeatMusic,
    stopMusic: endMusic,
    pauseMusic: pauseMusic,
    resumeMusic: resumeMusic,
    endAll: endAll
}