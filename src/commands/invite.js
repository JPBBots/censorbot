exports.run = (client,msg,args) => {
    msg.delete()
    msg.reply('`Invite me:` ' + client.config.invitesite)
    console.log(`Shard ${client.shard.id} | ${msg.author} ${msg.author.username} Requested an Invite...`)
    client.msg("log", `${msg.author} ${msg.author.username} Requested an Invite...`)
}
exports.info = {
    name: 'invite',
    description: "Sends link to invite the bot",
    format: "{prefix}invite",
    aliases: ["inv"]
}