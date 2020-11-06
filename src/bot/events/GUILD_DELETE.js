module.exports = function (guild) {
  if (guild.unavailable) this.unavailables.set(guild.id, true)

  this.cluster.internal.sendWebhook('guilds',
    this.embed
      .color(guild.unavailable ? 'ORANGE' : 'RED')
      .title(guild.unavailable ? 'Guild Unavailable' : 'Left Guild')
      .description(`${guild.id}`)
      .timestamp()
  )

  if (guild.unavailable) return

  this.db.collection('punish').removeMany({ guild: guild.id })
  this.db.collection('timeouts').removeMany({ guild: guild.id })

  this.stats.guilds.count.delete()
}
