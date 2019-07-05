exports.run = (client,message,args) => message.reply("Your server ID: " + message.guild.id)
exports.info = {
    name: 'serverid',
    description: "Gives ID for the server it's ran in",
    format: "{prefix}serverid"
}