const fs = require("fs")
const path = require("path")
const { Readable } = require("stream")
const { google } = require("googleapis")
const logger = require("@adamseidman/logger")

const KEY_FILE = 'google-service-account-key.json'

let backupsEnabled = fs.existsSync(path.join(__dirname, KEY_FILE))
if (!backupsEnabled) {
    console.warn('No key file! Google backups not enabled.')
}

async function uploadBackup(filename, data) {
    if (!backupsEnabled) {
        logger.warn('Not performing Google backup (disabled)')
        return
    }

    const auth = new google.auth.GoogleAuth({
        keyFile: `apis/${KEY_FILE}`,
        scopes: ['https://www.googleapis.com/auth/drive.file']
    })
    const drive = google.drive({ version: 'v3', auth })

    try {
        const body = typeof data === 'string'? fs.createReadStream(data)
            : Readable.from([JSON.stringify(data)])
        const response = await drive.files.create({
            requestBody: {
                name: filename,
                parents: [process.env.GOOGLE_BACKUP_FOLDER_ID]
            },
            media: { mimeType: 'application/json', body },
            fields: 'id'
        })
        logger.debug('Google backup uploaded.', response.data?.id)
    } catch (error) {
        logger.error('Error uploading Google backup.', error)
    }
}

module.exports = { uploadBackup }
