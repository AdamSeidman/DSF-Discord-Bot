const stats = require("../../db/tables/stats")

module.exports = {
    response: (msg, params) => {
        console.log(stats.getStats(msg.member.id)) // TODO
    },
    argModifier: (builder) => {
        builder.addUserOption((option) => 
            option
                .setName('person')
                .setDescription('User to get stats of')
                .setRequired(false)
        )
    },
    helpMsg: 'Lists your daily stupid fact statistics.'
}
