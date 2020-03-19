module.exports = function (guild) {
  const available = this.unavailables.has(guild.id)
  if (available) this.unavailables.delete(guild.id)

  this.webhooks.send('guilds',
    this.embed
      .color(available ? 'YELLOW' : 'GREEN')
      .title(available ? 'Server Available' : 'Joined New Server')
      .description(`${guild.name} (${guild.id})`)
      .field('Owner ID', guild.owner_id)
      .field('Member Count', guild.member_count)
      .timestamp()
  )

  this.log(6, 18, guild.id, guild.name)

  this.db.config(guild.id)
}
