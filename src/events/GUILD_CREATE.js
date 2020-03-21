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

  if (available) return

  this.interface.dm(guild.owner_id,
    this.embed
      .title(`Thanks for inviting me to your server! (${guild.name})`)
      .description(`We hope you enjoy your time, and hope we can make your server a cleaner place!\n\nHere are some useful resources:\nDashboard: https://censorbot.jt3ch.net/dash\n[Support Server](${this.config.support})\n[Premium](https://censorbot.jt3ch.net/premium)\n\nThanks again!`)
      .footer(guild.id)
  )
}
