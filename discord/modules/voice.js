const path = require('path')

const logger = require('../../utils/logger')
const effects = require('../../db/media/effects')
const { randomNumber } = require('../../utils/utils')
const { createAudioResource, createAudioPlayer, NoSubscriberBehavior,
    joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice')

const MIN_SILENCE_SECONDS = 60 * 5
const MAX_SILENCE_SECONDS = 60 * 15

const MUSIC_ASSET = path.join(__dirname, '../../assets', 'music.mp3')
const SILENCE_ASSET = path.join(__dirname, '../../assets', 'silence.mp3')

const guilds = {}

function getGuild(msg, createIfUnavailable=false) {
    if (!guilds[msg.guild.id]) {
        if (!createIfUnavailable) return
        guilds[msg.guild.id] = {
            guildId: msg.guild.id,
            channelId: msg.member.voice.channel.id,
            player: null,
            connection: null,
            paused: false,
            persistant: false,
            periodic: false,
            isMusic: false,
            originalMsg: msg,
            timeoutId: -1,
        }
    }
    return guilds[msg.guild.id]
}

function userInVoice(msg) {
    return !!msg.member?.voice.channel
}

function playResource(msg, args={}) {
    if (!userInVoice(msg)) return false

    const guild = getGuild(msg, true)
    if (guild === undefined) return false

    if (!guild.player || !guild.connection || !guild.channelId === msg.channel.id) {
        guild.player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause
            }
        })
        guild.connection = joinVoiceChannel({
            channelId: guild.channelId,
            guildId: guild.guildId,
            adapterCreator: msg.channel.guild.voiceAdapterCreator,
            selfDeaf: false
        })

        guild.player.on(AudioPlayerStatus.Idle, () => {
            cancelSchedule(guild)
            if (guild.paused) return

            if (guild.persistant) {
                if (guild.periodic) {
                    scheduleRandomEffect(guild)
                } else {
                    guild.player.play(effects.getRandomEffect())
                }
            } else {
                guild.connection.destroy()
                delete guilds[guild.guildId]
            }
        })
        guild.player.on('error', (error) => {
            logger.error('Error with voice player.', error)
        })
    }
    cancelSchedule(guild)

    if (typeof args.effect === 'string') {
        guild.music = false
        guild.persistant = false
        const effect = effects.getEffect(args.effect)
        if (!effect) return false
        guild.player.play(effect)
    } else if (args.continuous) {
        guild.persistant = true
        guild.isMusic = false
        guild.periodic = !!args.periodic
        guild.player.play(createAudioResource(SILENCE_ASSET))
    } else {
        guild.persistant = false
        guild.isMusic = true
        guild.player.play(createAudioResource(MUSIC_ASSET))
    }
    guild.connection.subscribe(guild.player)
    return true
}

function cancelSchedule(guild) {
    if (!guild || (guild.timeoutId || -1) < 0) return

    clearTimeout(guild.timeoutId)
    guild.timeoutId = -1
}

function scheduleRandomEffect(guild) {
    if (!guild?.player) return
    cancelSchedule(guild)

    guild.timeoutId = setTimeout(() => {
        guild.player.play(effects.getRandomEffect())
    }, (randomNumber(MAX_SILENCE_SECONDS - MIN_SILENCE_SECONDS) + MIN_SILENCE_SECONDS) * 1000)
}

function startSilence(msg) {
    return playResource(msg, { periodic: true, continuous: true })
}

function startLoud(msg) {
    return playResource(msg, { periodic: false, continuous: true })
}

function playEffect(msg, effect) {
    return playResource(msg, { effect })
}

function playMusic(msg) {
    return playResource(msg)
}

function pause(msg) {
    if (!userInVoice(msg)) return false

    const guild = getGuild(msg)
    if (guild === undefined || guild.paused || !guild.player) return false

    cancelSchedule(guild)
    guild.paused = true
    guild.player.pause()
    return true
}

function resume(msg) {
    if (!userInVoice(msg)) return false

    const guild = getGuild(msg)
    if (guild === undefined || !guild.paused || !guild.player) return false

    guild.paused = false
    guild.player.unpause()

    if (guild.persistant) {
        scheduleRandomEffect(guild)
    }
    return true
}

function stop(msg) {
    const guild = getGuild(msg)
    if (guild === undefined) return false

    guild.player?.stop()
    guild.connection?.destroy()
    delete guilds[guild.guidId]
    return true
}

function stopAll() {
    Object.values(guilds).forEach((guild) => {
        guild.player?.stop()
        guild.connection?.destroy()
        delete guild[guild.guildId]
    })
    return true
}

module.exports = {
    startSilence,
    startLoud,
    playEffect,
    playMusic,
    pause,
    resume,
    stop,
    stopAll
}
