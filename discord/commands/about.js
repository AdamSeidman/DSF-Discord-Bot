const Discord = require("discord.js")
const { author, homepage, version } = require("../../package.json")

module.exports = {
    response: async (msg, params) => {
        let embed = new Discord.EmbedBuilder()
            .setColor('#34EB3A')
            .setTitle('About DSF')
            .setDescription(`Version ${version}`)
            .setFields({
                name: 'GitHub Repository',
                value: `[GitHub](${homepage})`
            }, {
                name: 'Copyright',
                value: `© 2020-${new Date().getFullYear()} ${author}`
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
