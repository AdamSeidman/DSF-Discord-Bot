const Discord = require("discord.js")

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
                value: `© 2020-${new Date().getFullYear()} Adam Seidman`
            })
            .setTimestamp()
        if (params.injected) {
            await msg.channel.send({ embeds: [embed] })
        } else {
            await msg.reply({ embeds: [embed] })
        }
    },
    helpMsg: 'Information about DSF Bot'
}
