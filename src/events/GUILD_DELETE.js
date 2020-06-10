module.exports = function (guild) {
  if (guild.unavailable) this.unavailables.set(guild.id, true)

  this.webhooks.send('guilds',
    this.embed
      .color(guild.unavailable ? 'ORANGE' : 'RED')
      .title(guild.unavailable ? 'Guild Unavailable' : 'Left Guild')
      .description(`${guild.id}`)
      .timestamp()
  )

  if (guild.unavailable) return

  this.db.collection('punishments').removeMany({ g: guild.id })
}
