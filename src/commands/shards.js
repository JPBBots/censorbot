exports.run = async (client,message) => {
    message.delete()
    let shardinfo = {
        ping: await client.shard.fetchClientValues('ws.ping'),
        server_count: await client.shard.fetchClientValues('guilds.size'),
        user_count: await client.shard.fetchClientValues('users.size'),
        uptime: await client.shard.fetchClientValues("uptime")
    }
    let shardembed = new client.discord.MessageEmbed()
    .setTitle('Shard information/statistics')
    .setFooter('This server is being processed by shard ' + client.shard.id)
    .setColor('BLURPLE')
    .setThumbnail(client.user.avatarURL())
    for(i=0;i<client.shard.count;i++) {
        shardembed.addField(`Shard ${i} | Ping: ${Math.round(shardinfo.ping[i])}ms`, `Processing ${shardinfo.server_count[i]} servers and ${shardinfo.user_count[i]} users. \nFor ${client.u.momentFormatTime(shardinfo.uptime[i])}`)
    }
    message.channel.send(shardembed)
}
exports.info = {
    name: 'shards',
    description: 'Gives info about the bot\'s shards',
    format: "{prefix}shards"
}