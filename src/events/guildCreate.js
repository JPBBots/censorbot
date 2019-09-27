module.exports = async (client, guild) => {
    const fs = require('fs')
    if (client.broken) return;
    client.update_count()
    // const botowner = client.users.get("142408079177285632")
    client.webhooks.joinAndLeave.send(
        client.u.embed
            .setColor("GREEN")
            .setTitle("Joined New Server")
            .setDescription(`${guild.name} (${guild.id})`)
            .addField("OwnerID", guild.ownerID, true)
            .addField("Member Count", guild.memberCount, true)
            .setTimestamp()
    )
    // botowner.send(`${guild.owner.user.username} and ${guild.name} | ${guild.owner} ${guild.ownerID} ${guild.owner.user.username} Invited ${client.config.name} to server ${guild.name} ${guild.id}... Awaiting Approval`)
    if(guild.channels.map(a=>a.name).includes('general')) {
        var newguildchannel = guild.channels.find(a => a.name === "general");
        if(newguildchannel.type == 'text') {
            if (!newguildchannel) {
                client.msg("serverList", `${guild.name} Owned By ${guild.owner}`)
            }
        }
    }
    let r = await client.rdb.create(guild.id, new client.config.serverConfig(guild.id))
    var l;
    if(r.inserted < 1) {
        l = " (Already Had Config)"
    } else {
        l = " (New config made for server)"
    }
    console.log(`Shard ${client.shard.id} | Joined ${guild.name} ${l}`.green)
    guild.owner.send("Hello! Thanks for inviting me to your server! Please join the support server to be updated about bot updates and problems and so you can get help if you find a problem")
}