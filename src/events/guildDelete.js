module.exports = (client, guild) => {
    if (client.broken) return;
    client.update_count()
    client.webhooks.joinAndLeave.send(
        client.u.embed
            .setColor("RED")
            .setTitle("Left Server")
            .setDescription(`${guild.name} (${guild.id})`)
            .addField("OwnerID", guild.ownerID, true)
            .addField("Member Count", guild.memberCount, true)
            .setTimestamp()
    )
    // client.msg("joinAndLeave", `${guild.owner} ${guild.ownerID} removed from server ${guild.name} ${guild.id}`)
    console.log(`Shard ${client.shard.id} | Left ${guild.name}`.magenta)
    // const botowner = client.users.get("142408079177285632")
    // botowner.send(`left ${guild.name}`)
}