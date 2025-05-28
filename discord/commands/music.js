const { playMusic } = require('../modules/voice')

module.exports = {
    response: (msg) => {
        msg.reply({
            content: (playMusic(msg)? 'Playing...' : 'Failed to start playing music.'),
            ephemeral: true
        })
    },
    helpMsg: 'Plays endless music.',
    isSlashCommand: true
}
