/**
 * Author: Adam Seidman
 * 
 * Keep track of each servers host and repick if necessary
 */

const utils = require('poop-sock')
const { getRandomFact } = require('./facts')
const config = require('../client/config')
const log = require('better-node-file-logger')

let hostList = {} // Map for all server hosts
let updateFn = undefined

// Run a SQL host update. Callback fn will typically be a message to the guild
var makeHost = function (guild, callback, previousId) {
    guild.members.fetch({ force: true })
        .then(members => {
            members = [...members].map(x => x[1])
            let host = utils.randomArrayItem(members)
            members = members.filter(x => !x.user.bot)
            if (members.length > 0) {
                hostList[`${guild.id}`] = {
                    hostId: host.id,
                    votes: []
                }
                updateFn(guild.id, host.id)
            }
            if (callback !== undefined && previousId !== undefined) {
                if (members.length <= 1 || `${previousId}` !== hostList[`${guild.id}`].hostId) {
                    callback()
                } else {
                    makeHost(guild, callback, previousId)
                }
            }
        })
        .catch(log.Error)
}

// Run on startup to make hosts
var registerHosts = function (serverCache, getPrelimHost, updateCallback) {
    updateFn = updateCallback
    serverCache.forEach(guild => {
        let host = getPrelimHost(guild.id)
        if (host === undefined) {
            makeHost(guild)
        } else {
            // Log db host
            hostList[`${guild.id}`] = {
                hostId: host.hostId,
                votes: []
            }
        }
    })
}

// Event when /repick is done
var doRepick = function (guild, replyFn) {
    let callback = function () {
        replyFn(`The repick vote has passed!\n<@${hostList[`${guild.id}`].hostId}> is now the host.`)
    }
    makeHost(guild, callback, hostList[`${guild.id}`].hostId)
}

// Message handler for /repick. Has three different cases for responding/making host
var repickEvent = function (guild, replyFn, userId) {
    if (hostList[`${guild.id}`] === undefined) {
        makeHost(guild)
    }
    if (hostList[`${guild.id}`].hostId === `${userId}`) {
        replyFn(`${config.constants.selfRepickMessage}\nHave a fact instead:\n${getRandomFact(false, false)}`)
    } else if (hostList[`${guild.id}`].votes.includes(`${userId}`)) {
        replyFn(`You have already voted to repick <@${hostList[`${guild.id}`].hostId}>.${config.constants.doubleRepickMessage}`)
    } else {
        guild.members.fetch()
            .then(members => {
                hostList[`${guild.id}`].votes.push(`${userId}`)
                let totalUsers = [...members].map(x => x[1]).filter(x => !x.user.bot).length - 1
                let numberVotes = hostList[`${guild.id}`].votes.length
                if (numberVotes >= (totalUsers / 3)) {
                    doRepick(guild, replyFn)
                } else {
                    replyFn(`There are ${Math.ceil(totalUsers / 3) - numberVotes} more vote(s) needed in order to repick <@${hostList[`${guild.id}`].hostId}>.`)
                }
            })
            .catch(log.Error)
    }
}

module.exports = {
    registerHosts,
    repickEvent
}
