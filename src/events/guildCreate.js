module.exports = async (client, guild) => {
  const fs = require('fs')
  if (client.broken) return
  client.update_count()
  
  if (client.unavailables.has(guild.id)) {
    client.unavailables.delete(guild.id)
    return client.webhooks.joinAndLeave.send(
      client.u.embed
        .setColor('ORANGE')
        .setTitle('Server Available')
        .setDescription(`${guild.name} (${guild.id})`)
        .addField('OwnerID', guild.ownerID, true)
        .addField('Member Count', guild.memberCount, true)
        .setTimestamp()
        .setFooter(`Shard ${client.shard.id}`)
    )
  }
  
  client.webhooks.joinAndLeave.send(
    client.u.embed
      .setColor('GREEN')
      .setTitle('Joined New Server')
      .setDescription(`${guild.name} (${guild.id})`)
      .addField('OwnerID', guild.ownerID, true)
      .addField('Member Count', guild.memberCount, true)
      .setTimestamp()
      .setFooter(`Shard ${client.shard.id}`)
  )
  
  const db = await client.rdb.getAll(guild.id)
  if (db) {
    console.log(`Shard ${client.shard.id} | Joined ${guild.name} | Already Had Config`.green)
  } else {
    await client.rdb.create(guild.id, new client.config.serverConfig(guild.id))
    guild.owner.send(client.u.embed
      .setTitle(`Thanks for inviting me to your server! (${guild.name})`)
      .setDescription(`We hope you enjoy your time, and hope we can make your server a cleaner place!\n\nHere are some useful resources:\nDashboard: https://censorbot.jt3ch.net/dash\n[Support Server](${client.config.support})\n[Premium](https://censorbot.jt3ch.net/premium)\n\nThanks again!`)
      .setColor('GREEN')
      .setFooter(guild.id)
    )
  }
}
