const Discord = require('discord.js')

module.exports = {
    response: async (msg, params) => {
        let embed = new Discord.EmbedBuilder()
            .setColor('#34EB3A')
            .setTitle('About DSF')
            .setFields({
                name: 'GitHub Repository',
                value: '[GitHub](https://github.com/AdamSeidman/DSF-Discord-Bot)'
            }, {
                name: 'Copyright',
                value: '© 2020-2025 Adam Seidman'
            })
            .setTimestamp()
        if (params.injected) {
            msg.channel.send({ embeds: [embed] })
        } else {
            msg.reply({ embeds: [embed] })
        }
    },
    altMsg: 'Information about DSF Bot'
}
