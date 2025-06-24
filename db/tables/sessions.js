const crypto = require("crypto")
const { Table } = require("../database")
const session = require("express-session")

const table = new Table('webSessions')

const ERROR_CODE_NO_DATA = 'PGRST116'

async function destroySession(sid, callback) {
    if (typeof callback !== 'function') {
        callback = () => {}
    }
    try {
        const { error } = await table.client
            .from(table.name)
            .delete()
            .eq('session_id', sid)
        
        if (error) {
            callback(error)
        } else {
            callback(null)
        }
    } catch (error) {
        callback(error)
    }
}

class SessionStore extends session.Store {
    constructor() {
        super()

        this.get = async function (sid, callback) {
            try {
                const { data, error } = await table.client
                    .from(table.name)
                    .select('data')
                    .eq('session_id', sid)
                    .single()
                
                if (error && error.code !== ERROR_CODE_NO_DATA) {
                    callback(error, null)
                } else {
                    callback(null, data? JSON.parse(data.data) : null)
                }
            } catch (error) {
                callback(error, null)
            }
        }

        this.set = async function (sid, sessionData, callback) {
            try {
                const session_id = sid || crypto.randomBytes(16).toString('hex')

                const { error } = await table.client
                    .from(table.name)
                    .upsert({
                        session_id,
                        data: JSON.stringify(sessionData),
                        updated_at: 'NOW()'
                    })
                
                if (error) {
                    callback(error)
                } else {
                    callback(null)
                }
            } catch (error) {
                callback(error)
            }
        }

        this.destroy = destroySession
    }
}

module.exports = {
    refresh: () => table.refresh(),
    SessionStore,
    destroy: destroySession,
    getAll: () => table.data
}
