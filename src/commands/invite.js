exports.run = (client,msg,args) => {
    msg.delete()
    msg.reply('`Invite me:` ' + client.config.invitesite)
}
exports.info = {
    name: 'invite',
    description: "Sends link to invite the bot",
    format: "{prefix}invite",
    aliases: ["inv"]
}