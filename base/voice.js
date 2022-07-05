/**
 * Author: Adam Seidman
 * 
 * Provides ability to interact with discord voice channels.
 * 
 * Exports:
 *     playMusic: Play a .mp3 in /assets
 *     stopMusic: Stop .mp3 and remove DSF from voice
 *     pauseMusic: pause .mp3
 *     resumeMusic: resume after pausing .mp3
 *     endAll: Remove DSF from every voice channel in every server
 */

const fs = require('fs') // Need to read .mp3's from /assets

const dir = './assets/'
const fxDir = 'sound-effects/'
const ext = '.mp3'

var effectNames = []
fs.readdir(`${dir}${fxDir}`, (err, files) => {
    files.forEach(file => {
        if (file.toLowerCase().endsWith(ext)) {
            effectNames.push(file.toLowerCase().substring(0, file.length - ext.length))
        }
    })
})

// Keep track of servers that have DSF in voice
var servers = {} // IDs are stored as #[ID number]

// Remove DSF from voice on all servers (guilds)
var endAll = () => Object.keys(servers).forEach(x => handleServerLog({guild: {id: x.slice(1)}}, false))

// Handle adding or removing servers from log
// Also closes connections of stopped music
var handleServerLog= function (msg, start, connection, dispatcher) {
    const ID = `#${msg.guild.id}`
    if (start) {
        // If adding 
        if (servers[ID] !== undefined) {
            // If DSF is already in voice, change connection and dispatcher
            let item = servers[ID]
            item.connection = connection
            item.dispatcher = dispatcher
        } else {
            /// ...Otherwise, add it to server log
            servers[ID] = {
                connection: connection,
                dispatcher: dispatcher
            }
        }
    } else {
        let item = servers[ID] // Server info
        // Remove DSF from voice and delete log
        item.dispatcher.destroy()
        item.connection.disconnect()
        delete servers[ID]
    }
}

// Exported function to play music
var playMusic = async function (msg, song, isEffect) {
    if (msg.member.voice.channel) {
        let connection = undefined
        await msg.member.voice.channel.join().then(response => {
            connection = response
        })

        // Gather .mp3 to dispatcher
        const dispatcher = await connection.play(
            fs.createReadStream(`${dir}${isEffect ? fxDir : ''}${song}${ext}`)
        )
        // Set up connection
        handleServerLog(msg, true, connection, dispatcher)

        dispatcher.on('finish', () => {
            // Remove from voice on music ending
            handleServerLog(msg, false)
        })
        
        dispatcher.on('error', console.error)
    } else if (!isEffect) {
        msg.channel.send('You aren\'t in a voice channel.')
    }
}

// Exported function to stop music
var endMusic = function (msg) {
    if (servers[`#${msg.guild.id}`] !== undefined) {
        // Exists- stop music
        handleServerLog(msg, false)
    } else {
        // Bad Request
        msg.channel.send('No music is playing.')
    }
}

// Exported function to pause music
var pauseMusic = function (msg) {
    const ID = `#${msg.guild.id}`
    if (servers[ID] !== undefined) {
        // Contained in server log
        servers[ID].dispatcher.pause()
    } else {
        // Bad Request
        msg.channel.send('No music is playing.')
    }
}


// Exported function to resume music
var resumeMusic = function (msg) {
    const ID = `#${msg.guild.id}`
    if (servers[ID] !== undefined) {
        // Contained in server log
        servers[ID].dispatcher.resume()
    } else {
        // Bad request
        msg.channel.send('There is no music that is paused.')
    }
}

module.exports = {
    playMusic: playMusic,
    stopMusic: endMusic,
    pauseMusic: pauseMusic,
    resumeMusic: resumeMusic,
    endAll: endAll,
    effects: effectNames
}