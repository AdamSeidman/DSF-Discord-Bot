const fs = require('fs') // TODO Move everything to supabase (for all kinds of assets)
const logger = require('../../utils/logger')
const { randomArrayItem, copyObject } = require('../../utils/utils')
const { createAudioResource, createAudioPlayer, NoSubscriberBehavior,
    joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice')

const dir = './assets'
const fxDir = 'sound-effects/'
const ext = '.mp3'

let servers = {}
let effectNames = []

fs.readdir(`${dir}${fxDir}`, (_, files) => {
    if (files.length < 1) {
        logger.error('No effect files!', `${dir}${fxDir}`)
    }
    files.forEach((file) => {
        if (file.toLowerCase().endsWith(ext)) {
            effectNames.push(file.toLowerCase().substring(0, file.length - ext.length))
        }
    })
})

// Exported function to play music
function playMusic(msg, song, isEffect, keepAlive, isLoud) {
    if (!song) {
        song = randomArrayItem(effectNames)
        if (!isLoud) {
            logger.info(`Playing 'silence' sound effect [${song}].`, { keepAlive })
        }
    }
    if (typeof msg !== 'object') {
        msg = servers[`#${msg}`].msg
        if (!msg) {
            logger.warn('Invalid guildId provided for replaying music.', msg)
            return
        }
    }
    if (msg.member.voice.channel) {
        if (song === undefined || (isEffect && !effectNames.includes(song))) {
            logger.warn('Non-existant effect requested.', song)
            return
        }

        // Object to play an audio resource
        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause
            }
        })

        // Connection to specific channel in guild
        const connection = joinVoiceChannel({
            channelId: msg.member.voice.channel.id,
            guildId: msg.guildId,
            adapterCreator: msg.channel.guild.voiceAdapterCreator,
            selfDeaf: false
        })

        // Store locally
        servers[`#${msg.guildId}`] = {
            msg,
            isLoud,
            player,
            connection,
            paused: false,
            keepAlive: false || keepAlive,
        }

        // Create new resource from file
        player.play(createAudioResource(`${dir}${isEffect? fxDir : ''}${song}${ext}`))
        connection.subscribe(player)

        player.on(AudioPlayerStatus.Idle, () => {
            let server = servers[`#${msg.guildId}`]

            if (!server.paused) {
                if (server.isLoud) {
                    setTimeout(() => playMusic(msg, undefined, true, false, true), 1500)
                } else if (server.keepAlive) {
                    // If supposed to stay alive, pause
                    server.paused = true
                    server.player.pause()
                } else {
                    // Only stop if unpaused
                    connection.destroy()
                    delete servers[`#${msg.guildId}`]
                }
            }
        })

        player.on('error', (err) => {
            logger.error('Error with voice player.', err)
        })
        return true
    } else if (!isEffect) {
        msg.channel.send('You aren\'t in a voice channel.')
    }
}

function stopMusic(msg) {
    let server = servers[`#${msg.guildId}`]
    if (server) {
        server.player.stop()
        server.connection.destroy()
        delete servers[`#${msg.guildId}`]
    } else {
        msg.channel.send('No music is playing.')
    }
}

function pauseMusic(msg) {
    if (msg.member.voice.channel) {
        let server = servers[`#${msg.guildId}`]

        if (server === undefined || server.paused) {
            msg.channel.send('There is no music playing.')
        } else {
            server.paused = true
            server.player.pause()
        }
    } else {
        msg.channel.send('You aren\'t in a voice channel.')
    }
}

function resumeMusic(msg) {
    if (msg.member.voice.channel) {
        let server = servers[`#${msg.guildId}`]
        if (server === undefined || !server.paused) {
            msg.channel.send('There is no music that is paused.')
        } else {
            server.paused = false
            server.player.unpause()
        }
    } else {
        msg.channel.send('You aren\'t in a voice channel.')
    }
}

function getKeepAliveIds() {
    let results = []
    Object.keys(servers).forEach((id) => {
        if (servers[id].keepAlive) {
            results.push(servers[id].msg.guildId)
        }
    })
    return results
}

function endAll() {
    Object.keys(servers).forEach(x => stopMusic({ guildId: x.slice(1) }))
}

module.exports = {
    playMusic,
    pauseMusic,
    resumeMusic,
    endAll,
    effects: copyObject(effectNames),
    getKeepAliveIds
}
