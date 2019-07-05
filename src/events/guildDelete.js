module.exports = (client, guild) => {
    if (client.broken) return;
    client.update_count()
    client.msg("joinAndLeave", `${guild.owner} ${guild.ownerID} removed from server ${guild.name} ${guild.id}`)
    console.log(`Shard ${client.shard.id} | Left ${guild.name}`.magenta)
    const botowner = client.users.get("142408079177285632")
    botowner.send(`left ${guild.name}`)
}