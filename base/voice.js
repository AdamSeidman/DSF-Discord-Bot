/**
 * Author: Adam Seidman
 * 
 * Provides ability to interact with discord voice channels.
 * 
 * Exports:
 *     playMusic: Play a .mp3 in /assets
 *                 - Returns true if sound is played
 *     stopMusic: Stop .mp3 and remove DSF from voice
 *     pauseMusic: Pause .mp3
 *     resumeMusic: Resume after pausing .mp3
 *     endAll: Remove DSF from every voice channel in every server
 *     effects: List of all effect names from folder
 */

const { createAudioResource, createAudioPlayer, NoSubscriberBehavior,
    joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice')
const fs = require('fs') // Need to read .mp3's from /assets
const config = require('../client/config')
const log = require('better-node-file-logger')

const dir = './assets/'
const fxDir = 'sound-effects/'
const ext = config.constants.soundEffectType

var servers = {}
var effectNames = []

fs.readdir(`${dir}${fxDir}`, (err, files) => {
    files.forEach(file => {
        if (file.toLowerCase().endsWith(ext)) {
            effectNames.push(file.toLowerCase().substring(0, file.length - ext.length))
        }
    })
})

// Exported function to play music
var playMusic = async function (msg, song, isEffect, keepAlive, isLoud) {
    if (isEffect && !config.options.hasSoundEffects) return

    if (song === undefined) {
        song = effectNames[Math.floor(Math.random() * effectNames.length)]
        if (!isLoud) {
            log.info(`Playing 'silence' sound effect [${song}]. Keep alive: ${keepAlive}`)
        }
    }

    if (typeof(msg) !== 'object') {
        msg = servers[`#${msg}`].msg
        if (msg === undefined) {
            log.warn('Invalid guildId provided for replaying music.', msg)
            return
        }
    }

    if (msg.member.voice.channel) {
        if (song === undefined || (isEffect && !effectNames.includes(song))) {
            log.warn('Non-existant effect requested.', song)
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

        servers[`#${msg.guildId}`] = {
            connection: connection,
            player: player,
            paused: false,
            keepAlive: false || keepAlive,
            msg: msg,
            isLoud: isLoud
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

        player.on('error', err => {
            log.error('Error with voice player.', err)
        })

        return true
    } else if (!isEffect) {
        msg.channel.send('You aren\'t in a voice channel.')
    }
}

var endMusic = function (msg) {
    let server = servers[`#${msg.guildId}`]
    if (server !== undefined) {
        // Exists- stop music
        server.player.stop()
        server.connection.destroy()
        delete servers[`#${msg.guildId}`]
    } else {
        // Bad Request
        msg.channel.send('No music is playing.')
    }
}

var pauseMusic = function (msg) {
    if (msg.member.voice.channel) {
        let server = servers[`#${msg.guildId}`]

        if (server === undefined || server.paused) {
            msg.channel.send('There is no music playing.')
        } else{
            server.paused = true
            server.player.pause()
        }
    } else {
        msg.channel.send('You aren\'t in a voice channel.')
    }
}

var resumeMusic = function (msg) {
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

var getKeepAliveIds = function () {
    let results = []
    Object.keys(servers).forEach(id => {
        if (servers[id].keepAlive) results.push(servers[id].msg.guildId)
    })
    return results
}

var endAll = () => {
    Object.keys(servers).forEach(x => endMusic({guildId: x.slice(1)}))
}

module.exports = {
    playMusic,
    pauseMusic,
    resumeMusic,
    endAll,
    stopMusic: endMusic,
    effects: effectNames,
    getKeepAliveIds
}
