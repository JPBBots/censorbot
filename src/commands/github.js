exports.run = async (client,message,args) => {
    message.delete()
    const msg = await message.reply("Github REPO Sent to DM's")
    setTimeout(function() {
        msg.delete()
    }, 6000);
    message.author.send(client.config.github)
    console.log(`Shard ${client.shard.id} | ${message.author} ${message.author.username} Requested GitHub...`)
    client.msg("log", `${message.author} ${message.author.username} Requested GitHub...`)
}
exports.info = {
    name: 'github',
    description: "Displays the github link",
    format: "{prefix}github"
}