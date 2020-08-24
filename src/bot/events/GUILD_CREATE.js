const allowedGuilds = global.botIsCustom
  ? process.env.ALLOWED_GUILDS.split(',')
  : false

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

  this.db.config(guild.id)

  if (available) return

  if (allowedGuilds && !allowedGuilds.includes(guild.id)) {
    this.log(`Tried to join ${guild.id}, but not allowed.`)
    return this.interface.leaveGuild(guild.id)
  }

  this.interface.dm(guild.owner_id,
    this.embed
      .title(`Thanks for inviting me to your server! (${guild.name})`)
      .description(`We hope you enjoy your time, and hope we can make your server a cleaner place!\n\nHere are some useful resources:\nDashboard: ${this.config.dashboard}\n[Support Server](${this.config.support})\n[Premium](https://censor.bot/premium)\n\nThanks again!`)
      .footer(guild.id)
  )
}
