const { Table } = require("../database")
const { randomArrayItem } = require("logic-kit")

const table = new Table('hosts')

function setupHost(userId, guild) {
    return new Promise((resolve, reject) => {
        guild.members.fetch({ force: true })
        .then(async (members) => {
            let users = [...members].map(x => x[1]).filter(x => !x.user.bot && x.user.id != userId)
            if (users.length < 1) {
                users = [...members].map(x => x[1])
            }
            const host = randomArrayItem(users)?.user
            if (!host) {
                throw new Error('Could not pick host!')
            }
            const record = {
                host_name: host.username,
                host_id: host.id,
                guild_name: guild.name,
                guild_id: guild.id,
                repick_list: JSON.stringify([`${userId}`])
            }
            const { error } = await table.client
                .from(table.name)
                .insert(record)
            if (error) {
                throw error
            } else {
                resolve(record.host_id)
            }
        })
        .catch((error) => {
            reject(error)
        })
    })
}

function attemptRepick(userId, guild, data) {
    const result = {
        error: null,
        repicked: false,
        votesLeft: -1
    }
    return new Promise((resolve) => {
        guild.members.fetch()
            .then((members) => {
                let pickList = JSON.parse(data.repick_list)
                const requiredVotes = ([...members].map(x => x[1]).filter(x => !x.user.bot).length - 1) / 3
                const currentVotes = pickList.length
                data.last_modified = 'NOW()'
                if ((currentVotes + 1) >= requiredVotes) {
                    result.repicked = true
                    let users = [...members].map(x => x[1]).filter(x => !x.user.bot && x.id != data.host_id)
                    if (users.length < 1) {
                        users = members
                    }
                    const host = randomArrayItem(users)?.user
                    result.hostId = host.id
                    data.host_id = host.id
                    data.host_name = host.username
                    data.repick_list = '[]'
                } else {
                    result.votesLeft = Math.ceil(requiredVotes - (currentVotes + 1))
                    data.repick_list = JSON.stringify([...pickList, `${userId}`])
                }
                return table.client
                    .from(table.name)
                    .update(data)
                    .eq('id', data.id)
            })
            .then(({ error }) => {
                if (error) {
                    result.error = error
                }
                resolve(result)
            })
            .catch((error) => {
                result.error = error
                resolve(result)
            })
    })
}

async function submitRepick(userId, guild) {
    const result = {
        isHost: false,
        repicked: false,
        submitted: false,
        alreadyPicked: false,
        first: false,
        hostId: -1,
        error: null,
        votesLeft: -1
    }
    let data = table.data.filter(x => x.guild_id == guild.id)[0]
    if (data) {
        result.hostId = data.host_id
        if (JSON.parse(data.repick_list).filter(x => x == userId).length > 0) {
            result.alreadyPicked = true
        } else if (result.hostId == userId) {
            result.isHost = true
        } else {
            const repick = await attemptRepick(userId, guild, data)
            result.votesLeft = repick.votesLeft
            if (repick.error) {
                result.error = repick.error
            } else if (repick.repicked) {
                result.hostId = repick.hostId
                result.repicked = true
                result.submitted = true
            } else {
                result.submitted = true
            }
        }
    } else {
        first = true
        try {
            result.hostId = await setupHost(userId, guild)
            submitted = true
        } catch (error) {
            result.error = error
        }
    }
    await table.refresh()
    return result
}

function isHostMessage(msg) {
    const guild = table.data.filter(x => x.guild_id == msg.guild?.id)[0]
    if (!guild) {
        return false
    }
    return (guild.host_id == msg.member?.id)
}

module.exports = {
    refresh: () => table.refresh(),
    submitRepick,
    isHostMessage
}
