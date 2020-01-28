module.exports = (client, guild) => {
    client.unavailables.set(guild.id, true)
    client.webhooks.joinAndLeave.send(
        client.u.embed
            .setColor('YELLOW')
            .setTitle('Server Unavailable')
            .setDescription(`${guild.name} (${guild.id})`)
            .addField('OwnerID', guild.ownerID, true)
            .addField('Member Count', guild.memberCount, true)
            .setTimestamp()
            .setFooter(`Shard ${client.shard.id}`)
    )
}
