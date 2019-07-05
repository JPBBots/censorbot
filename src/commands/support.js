exports.run = async (client,message,args) => {
    message.delete()
    const msg = await message.reply("Support Server Sent to DM's")
    setTimeout(function() {
        msg.delete()
    }, 6000);
    message.author.send(client.config.support)
    console.log(`Shard ${client.shard.id} | ${message.author} ${message.author.username} Requested Support...`)
    client.msg("log", `${message.author} ${message.author.username} Requested Support...`)
}
exports.info = {
    name: 'support',
    description: "Sends invite to support server to DMs",
    format: "{prefix}support"
}