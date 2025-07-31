const fs = require("fs")
const path = require("path")
const { copyObject } = require("logic-kit")
const logger = require("@adamseidman/logger")
const { createClient } = require("@supabase/supabase-js")
const { uploadBackup: googleBackup } = require("../apis/google")

const BACKUP_HOURS = 24
const INITIAL_BACKUP_HOURS = 2
const REFRESH_MINUTES = 20
const BUCKET_LIMIT = 1000

const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLIC_KEY
const allTables = []

let client = createClient(process.env.SUPABASE_URL, key)
if (!client) {
    logger.fatal('Could not create database!', process.env.SUPABASE_URL)
    throw new Error()
}

class Table {
    #data = []

    constructor(tableName, callback) {
        this.name = tableName
        this.client = client
        this.#init(callback)
        allTables.push(this)
    }
    
    async #init(callback) {
        const { error, data } = await this.client.from(this.name).select()
        if (error) {
            logger.error(`Error initializing ${this.name}`, error)
            throw new Error(error)
        }
        this.#data = data
        if (typeof callback === 'function') {
            callback(this)
        }
    }

    async refresh() {
        const { data, error } = await this.client.from(this.name).select()
        if (error) {
            logger.error(`Error refreshing ${this.name}`, error)
        } else if (data) {
            this.#data = data
        }
    }

    get data() {
        return copyObject(this.#data)
    }
}

class Bucket {
    #data = {}

    constructor(bucketName, callback) {
        this.name = bucketName
        this.client = client
        this.#init(callback)
    }

    async #init(callback) {
        const { error, data } = await this.client.storage.from(this.name).list('', { limit: BUCKET_LIMIT })
        if (error) {
            logger.error(`Error initializing ${this.name}`, error)
            throw new Error(error)
        }
        data.forEach((item) => {
            this.#data[item.name.slice(0, item.name.indexOf('.')).toLowerCase()] = `${this.name}/${item.name}`
        })
        if (typeof callback === 'function') {
            callback(this)
        }
    }

    async refresh() {
        const { data, error } = await this.client.storage.from(this.name).list('', { limit: BUCKET_LIMIT })
        if (error) {
            logger.error(`Error refreshing ${this.name}`, error)
        } else if (data) {
            this.#data = {}
            data.forEach((item) => {
                this.#data[item.name.slice(0, item.name.indexOf('.')).toLowerCase()] = `${this.name}/${item.name}`
            })
        }
    }

    async #download(dirPath, fileKey) {
        const fileRemotePath = this.#data[fileKey]
        const fileLocalPath = path.join(dirPath, fileRemotePath.slice(fileRemotePath.lastIndexOf('/') + 1))
        if (fs.existsSync(fileLocalPath)) return
        const { data, error } = await this.client.storage.from(this.name)
            .download(fileRemotePath.replace(`${this.name}/`, ''))
        if (error || !data) {
            throw error || data
        }
        try {
            const buffer = await data.arrayBuffer()
            await fs.promises.writeFile(fileLocalPath, Buffer.from(buffer))
        } catch (error) {
            logger.error('Error writing db file.', { fileLocalPath, fileRemotePath, error })
        }
    }

    async downloadToDir(dirPath) {
        if (!fs.existsSync(dirPath)) {
            throw new Error('Dir not found.')
        }
        await this.refresh()
        let promises = []
        for (let fileKey in this.#data) {
            promises.push(this.#download(dirPath, fileKey))
        }
        await Promise.allSettled(promises)
    }

    get data() {
        return copyObject(this.#data)
    }
}

const refreshFns = []
let refreshIdx = 0

function init() {
    if (!client) return
    fs.readdirSync(path.join(__dirname, 'tables')).forEach((file) => {
        if (path.extname(file) === '.js') {
            const tableName = file.slice(0, file.indexOf('.'))
            const table = require(`@tables/${tableName}`)
            if (!table) {
                logger.error(`Could not load table: ${tableName}`, table)
                return
            }
            if (typeof table.refresh === 'function') {
                refreshFns.push(table.refresh)
            }
        }
    })
    fs.readdirSync(path.join(__dirname, 'media')).forEach((file) => {
        if (path.extname(file) === '.js') {
            const bucketName = file.slice(0, file.indexOf('.'))
            const bucket = require(`@media/${bucketName}`)
            if (!bucket) {
                logger.error(`Could not load bucket: ${bucketName}`, bucket)
                return
            }
            if (typeof bucket.refresh === 'function') {
                refreshFns.push(bucket.refresh)
            }
        }
    })
    logger.info('Database client loaded.')
}

setInterval(() => {
    if (refreshFns.length < 1) return
    try {
        refreshFns[refreshIdx]()
    } catch (error) {
        logger.error(`Error refreshing db function ${refreshIdx}.`, error)
    }
    refreshIdx = (refreshIdx + 1) % refreshFns.length
}, (REFRESH_MINUTES * 1000 * 60))

function backup() {
    logger.debug('Starting backup...')
    const out = {}
    allTables.forEach((table) => {
        out[table.name] = table.data
    })
    const filename = `backup_${new Date().toISOString()
        .replace(/[-:]/g, '').slice(0, 15).replace('T', '-')}.json`
    googleBackup(filename, out)
        .then(() => logger.info('Backup Completed', filename))
        .catch(logger.error)
}

setTimeout(() => {
    backup()
    setInterval(backup, (BACKUP_HOURS * 60 * 60 * 1000))
}, (INITIAL_BACKUP_HOURS * 60 * 60 * 1000))

function forceRefresh() {
    let refreshRoutines = refreshFns.map(async (fn, idx) => {
        try {
            await Promise.resolve(fn())
        } catch (error) {
            logger.error(`Error forcing db refresh of index ${idx}`, error)
        }
    })
    Promise.all(refreshRoutines)
        .then(() => logger.debug('Full refresh complete.'))
        .catch((error) => {
            logger.warn('Unexpected error during full db refresh', error)
        })
}

module.exports = {
    init,
    Table,
    Bucket,
    forceRefresh
}
