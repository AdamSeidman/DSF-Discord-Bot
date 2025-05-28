const { resume } = require('../modules/voice')

module.exports = {
    response: (msg, params) => {
        msg.reply(resume(msg)? 'Resuming music...' : 'Could not find music to resume.')
    },
    helpMsg: 'Resumes music, if playing.',
    isSlashCommand: true
}
